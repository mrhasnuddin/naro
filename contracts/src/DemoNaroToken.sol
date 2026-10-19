// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @notice Educational test token. No mint authority, taxes, upgrades, or monetary promise.
contract DemoNaroToken is ERC20Burnable {
    error UnsupportedNetwork();
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;

    constructor(address rewardPool) ERC20("Demo NARO", "dNARO") {
        if (block.chainid != 97 && block.chainid != 31337) revert UnsupportedNetwork();
        _mint(rewardPool, INITIAL_SUPPLY);
    }
}
