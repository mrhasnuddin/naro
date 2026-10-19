// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {DemoNaroToken} from "./DemoNaroToken.sol";

/// @notice Permissionless learning demo, not NARO's production economics.
/// @dev Deployable only on BSC testnet or the documented local EVM.
contract NaroDemo is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error UnsupportedNetwork();
    error AlreadyActive();
    error NotActive();
    error InvalidInviter();
    error ClaimNotReady(uint256 nextClaimAt);
    error PoolExhausted();
    error InvalidPageSize();

    bytes32 public constant DEMO_ID = keccak256("NARO_LEARNING_DEMO_V1");
    uint256 public constant CLAIM_REWARD = 10 ether;
    uint256 public constant CLAIM_COOLDOWN = 60;
    DemoNaroToken public immutable token;
    uint256 public memberCount;
    uint256 public totalClaimed;

    struct Member {
        address inviter;
        uint256 activatedAt;
        uint256 nextClaimAt;
        uint256 claimed;
        bool active;
    }
    mapping(address => Member) public members;
    mapping(address => address[]) private directMembers;

    event Activated(address indexed account, address indexed inviter, uint256 activatedAt);
    event Claimed(address indexed account, uint256 amount, uint256 nextClaimAt);

    constructor() {
        if (block.chainid != 97 && block.chainid != 31337) revert UnsupportedNetwork();
        token = new DemoNaroToken(address(this));
        members[msg.sender] = Member(address(0), block.timestamp, block.timestamp, 0, true);
        memberCount = 1;
        emit Activated(msg.sender, address(0), block.timestamp);
    }

    /// @notice Activation and permanent inviter binding happen in one gas-only transaction.
    /// @param inviter Zero for no inviter; otherwise an already-active, different account.
    function activate(address inviter) external {
        if (members[msg.sender].active) revert AlreadyActive();
        if (inviter == msg.sender || (inviter != address(0) && !members[inviter].active)) {
            revert InvalidInviter();
        }
        members[msg.sender] = Member(inviter, block.timestamp, block.timestamp, 0, true);
        ++memberCount;
        if (inviter != address(0)) directMembers[inviter].push(msg.sender);
        emit Activated(msg.sender, inviter, block.timestamp);
    }

    /// @notice Pays one fixed demo reward; missed minutes do not accumulate rewards.
    function claim() external nonReentrant {
        Member storage member = members[msg.sender];
        if (!member.active) revert NotActive();
        if (block.timestamp < member.nextClaimAt) revert ClaimNotReady(member.nextClaimAt);
        if (token.balanceOf(address(this)) < CLAIM_REWARD) revert PoolExhausted();
        member.nextClaimAt = block.timestamp + CLAIM_COOLDOWN;
        member.claimed += CLAIM_REWARD;
        totalClaimed += CLAIM_REWARD;
        IERC20(address(token)).safeTransfer(msg.sender, CLAIM_REWARD);
        emit Claimed(msg.sender, CLAIM_REWARD, member.nextClaimAt);
    }

    function claimable(address account) external view returns (uint256) {
        Member storage member = members[account];
        if (!member.active || block.timestamp < member.nextClaimAt || token.balanceOf(address(this)) < CLAIM_REWARD) return 0;
        return CLAIM_REWARD;
    }

    function directCount(address account) external view returns (uint256) {
        return directMembers[account].length;
    }

    /// @notice Bounded pagination avoids unbounded reads even for large demo communities.
    function referrals(address account, uint256 offset, uint256 limit) external view returns (address[] memory page) {
        if (limit == 0 || limit > 100) revert InvalidPageSize();
        uint256 length = directMembers[account].length;
        if (offset >= length) return new address[](0);
        uint256 size = length - offset;
        if (size > limit) size = limit;
        page = new address[](size);
        for (uint256 i; i < size; ++i) page[i] = directMembers[account][offset + i];
    }
}
