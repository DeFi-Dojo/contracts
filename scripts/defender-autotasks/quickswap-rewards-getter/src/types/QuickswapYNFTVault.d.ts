/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface QuickswapYNFTVaultInterface extends ethers.utils.Interface {
  functions: {
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "HARVESTER_ROLE()": FunctionFragment;
    "balanceOf(uint256)": FunctionFragment;
    "balanceOfUnderlying(uint256)": FunctionFragment;
    "beneficiary()": FunctionFragment;
    "createYNFT(address,uint256,uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "createYNFTForEther(uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "dQuick()": FunctionFragment;
    "depositETH(uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "depositTokens(address,uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "dexRouter()": FunctionFragment;
    "feePerMile()": FunctionFragment;
    "firstToken()": FunctionFragment;
    "getRewardLPMining()": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "nftToken()": FunctionFragment;
    "pair()": FunctionFragment;
    "pause()": FunctionFragment;
    "paused()": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "secondToken()": FunctionFragment;
    "setBeneficiary(address)": FunctionFragment;
    "setFee(uint256)": FunctionFragment;
    "stakingDualRewards()": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "unpause()": FunctionFragment;
    "withdrawToEther(uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    "withdrawToUnderlyingTokens(uint256,uint256,uint256,uint256)": FunctionFragment;
    "yNFT()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "HARVESTER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOfUnderlying",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "beneficiary",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createYNFT",
    values: [
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createYNFTForEther",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(functionFragment: "dQuick", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "depositETH",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "depositTokens",
    values: [
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(functionFragment: "dexRouter", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "feePerMile",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "firstToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRewardLPMining",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(functionFragment: "nftToken", values?: undefined): string;
  encodeFunctionData(functionFragment: "pair", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "secondToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setBeneficiary",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakingDualRewards",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "withdrawToEther",
    values: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawToUnderlyingTokens",
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "yNFT", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "HARVESTER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "balanceOfUnderlying",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "beneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createYNFT", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createYNFTForEther",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dQuick", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "depositETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "dexRouter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "feePerMile", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "firstToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRewardLPMining",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nftToken", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pair", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "secondToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBeneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakingDualRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawToEther",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawToUnderlyingTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "yNFT", data: BytesLike): Result;

  events: {
    "Paused(address)": EventFragment;
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "Unpaused(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export type PausedEvent = TypedEvent<[string] & { account: string }>;

export type RoleAdminChangedEvent = TypedEvent<
  [string, string, string] & {
    role: string;
    previousAdminRole: string;
    newAdminRole: string;
  }
>;

export type RoleGrantedEvent = TypedEvent<
  [string, string, string] & { role: string; account: string; sender: string }
>;

export type RoleRevokedEvent = TypedEvent<
  [string, string, string] & { role: string; account: string; sender: string }
>;

export type UnpausedEvent = TypedEvent<[string] & { account: string }>;

export class QuickswapYNFTVault extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: QuickswapYNFTVaultInterface;

  functions: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    HARVESTER_ROLE(overrides?: CallOverrides): Promise<[string]>;

    balanceOf(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    balanceOfUnderlying(
      _nftTokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    beneficiary(overrides?: CallOverrides): Promise<[string]>;

    createYNFT(
      _tokenIn: string,
      _amountIn: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    createYNFTForEther(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    dQuick(overrides?: CallOverrides): Promise<[string]>;

    depositETH(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositTokens(
      _tokenIn: string,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    dexRouter(overrides?: CallOverrides): Promise<[string]>;

    feePerMile(overrides?: CallOverrides): Promise<[BigNumber]>;

    firstToken(overrides?: CallOverrides): Promise<[string]>;

    getRewardLPMining(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<[string]>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    nftToken(overrides?: CallOverrides): Promise<[string]>;

    pair(overrides?: CallOverrides): Promise<[string]>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    paused(overrides?: CallOverrides): Promise<[boolean]>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    secondToken(overrides?: CallOverrides): Promise<[string]>;

    setBeneficiary(
      _beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setFee(
      _feePerMile: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakingDualRewards(overrides?: CallOverrides): Promise<[string]>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawToEther(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountOutETH: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawToUnderlyingTokens(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    yNFT(overrides?: CallOverrides): Promise<[string]>;
  };

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  HARVESTER_ROLE(overrides?: CallOverrides): Promise<string>;

  balanceOf(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

  balanceOfUnderlying(
    _nftTokenId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  beneficiary(overrides?: CallOverrides): Promise<string>;

  createYNFT(
    _tokenIn: string,
    _amountIn: BigNumberish,
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _amountMinLiqudityFirstToken: BigNumberish,
    _amountMinLiquditySecondToken: BigNumberish,
    _deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  createYNFTForEther(
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _amountMinLiqudityFirstToken: BigNumberish,
    _amountMinLiquditySecondToken: BigNumberish,
    _deadline: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  dQuick(overrides?: CallOverrides): Promise<string>;

  depositETH(
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _amountMinLiqudityFirstToken: BigNumberish,
    _amountMinLiquditySecondToken: BigNumberish,
    _deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositTokens(
    _tokenIn: string,
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _amountMinLiqudityFirstToken: BigNumberish,
    _amountMinLiquditySecondToken: BigNumberish,
    _deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  dexRouter(overrides?: CallOverrides): Promise<string>;

  feePerMile(overrides?: CallOverrides): Promise<BigNumber>;

  firstToken(overrides?: CallOverrides): Promise<string>;

  getRewardLPMining(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

  grantRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  hasRole(
    role: BytesLike,
    account: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  nftToken(overrides?: CallOverrides): Promise<string>;

  pair(overrides?: CallOverrides): Promise<string>;

  pause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  paused(overrides?: CallOverrides): Promise<boolean>;

  renounceRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  revokeRole(
    role: BytesLike,
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  secondToken(overrides?: CallOverrides): Promise<string>;

  setBeneficiary(
    _beneficiary: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setFee(
    _feePerMile: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakingDualRewards(overrides?: CallOverrides): Promise<string>;

  supportsInterface(
    interfaceId: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  unpause(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawToEther(
    _nftTokenId: BigNumberish,
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _amountOutETH: BigNumberish,
    _deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawToUnderlyingTokens(
    _nftTokenId: BigNumberish,
    _amountOutMinFirstToken: BigNumberish,
    _amountOutMinSecondToken: BigNumberish,
    _deadline: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  yNFT(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    HARVESTER_ROLE(overrides?: CallOverrides): Promise<string>;

    balanceOf(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOfUnderlying(
      _nftTokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    beneficiary(overrides?: CallOverrides): Promise<string>;

    createYNFT(
      _tokenIn: string,
      _amountIn: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    createYNFTForEther(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    dQuick(overrides?: CallOverrides): Promise<string>;

    depositETH(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    depositTokens(
      _tokenIn: string,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    dexRouter(overrides?: CallOverrides): Promise<string>;

    feePerMile(overrides?: CallOverrides): Promise<BigNumber>;

    firstToken(overrides?: CallOverrides): Promise<string>;

    getRewardLPMining(overrides?: CallOverrides): Promise<void>;

    getRoleAdmin(role: BytesLike, overrides?: CallOverrides): Promise<string>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    nftToken(overrides?: CallOverrides): Promise<string>;

    pair(overrides?: CallOverrides): Promise<string>;

    pause(overrides?: CallOverrides): Promise<void>;

    paused(overrides?: CallOverrides): Promise<boolean>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<void>;

    secondToken(overrides?: CallOverrides): Promise<string>;

    setBeneficiary(
      _beneficiary: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setFee(
      _feePerMile: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    stakingDualRewards(overrides?: CallOverrides): Promise<string>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    unpause(overrides?: CallOverrides): Promise<void>;

    withdrawToEther(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountOutETH: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawToUnderlyingTokens(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    yNFT(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "Paused(address)"(
      account?: null
    ): TypedEventFilter<[string], { account: string }>;

    Paused(account?: null): TypedEventFilter<[string], { account: string }>;

    "RoleAdminChanged(bytes32,bytes32,bytes32)"(
      role?: BytesLike | null,
      previousAdminRole?: BytesLike | null,
      newAdminRole?: BytesLike | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; previousAdminRole: string; newAdminRole: string }
    >;

    RoleAdminChanged(
      role?: BytesLike | null,
      previousAdminRole?: BytesLike | null,
      newAdminRole?: BytesLike | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; previousAdminRole: string; newAdminRole: string }
    >;

    "RoleGranted(bytes32,address,address)"(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; account: string; sender: string }
    >;

    RoleGranted(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; account: string; sender: string }
    >;

    "RoleRevoked(bytes32,address,address)"(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; account: string; sender: string }
    >;

    RoleRevoked(
      role?: BytesLike | null,
      account?: string | null,
      sender?: string | null
    ): TypedEventFilter<
      [string, string, string],
      { role: string; account: string; sender: string }
    >;

    "Unpaused(address)"(
      account?: null
    ): TypedEventFilter<[string], { account: string }>;

    Unpaused(account?: null): TypedEventFilter<[string], { account: string }>;
  };

  estimateGas: {
    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    HARVESTER_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    balanceOf(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOfUnderlying(
      _nftTokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    beneficiary(overrides?: CallOverrides): Promise<BigNumber>;

    createYNFT(
      _tokenIn: string,
      _amountIn: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    createYNFTForEther(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    dQuick(overrides?: CallOverrides): Promise<BigNumber>;

    depositETH(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositTokens(
      _tokenIn: string,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    dexRouter(overrides?: CallOverrides): Promise<BigNumber>;

    feePerMile(overrides?: CallOverrides): Promise<BigNumber>;

    firstToken(overrides?: CallOverrides): Promise<BigNumber>;

    getRewardLPMining(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    nftToken(overrides?: CallOverrides): Promise<BigNumber>;

    pair(overrides?: CallOverrides): Promise<BigNumber>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    paused(overrides?: CallOverrides): Promise<BigNumber>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    secondToken(overrides?: CallOverrides): Promise<BigNumber>;

    setBeneficiary(
      _beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setFee(
      _feePerMile: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakingDualRewards(overrides?: CallOverrides): Promise<BigNumber>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawToEther(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountOutETH: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawToUnderlyingTokens(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    yNFT(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    HARVESTER_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    balanceOf(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    balanceOfUnderlying(
      _nftTokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    beneficiary(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createYNFT(
      _tokenIn: string,
      _amountIn: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    createYNFTForEther(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    dQuick(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    depositETH(
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositTokens(
      _tokenIn: string,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountMinLiqudityFirstToken: BigNumberish,
      _amountMinLiquditySecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    dexRouter(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    feePerMile(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    firstToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRewardLPMining(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    hasRole(
      role: BytesLike,
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    nftToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pair(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    pause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    paused(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    revokeRole(
      role: BytesLike,
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    secondToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setBeneficiary(
      _beneficiary: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setFee(
      _feePerMile: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakingDualRewards(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    unpause(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawToEther(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _amountOutETH: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawToUnderlyingTokens(
      _nftTokenId: BigNumberish,
      _amountOutMinFirstToken: BigNumberish,
      _amountOutMinSecondToken: BigNumberish,
      _deadline: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    yNFT(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}