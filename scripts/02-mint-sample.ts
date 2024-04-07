import { Address, WalletTypes, zeroAddress } from "locklift";
import prompts from "prompts";
import BigNumber from "bignumber.js";

async function main() {
  const answers = await prompts([
    {
      type: "text",
      name: "contractAddress",
      message: "Contract address",
    },
    {
      type: "number",
      name: "mintAmount",
      message: "Mint amount (will be shifted by decimals)",
    },
    {
      type: "text",
      name: "tokensOwnerAddress",
      message: "Tokens owner address",
    },
    {
      type: "text",
      name: "tokensOwnerPublicKey",
      message: "Tokens owner public key",
    },
  ]);

  const tokenRoot = locklift.factory.getDeployedContract("TokenRoot", new Address(answers.contractAddress));

  const { value0: decimals } = await tokenRoot.methods.decimals({ answerId: 0 }).call();

  const sender = await locklift.factory.accounts.addExistingAccount({
    publicKey: answers.tokensOwnerPublicKey,
    type: WalletTypes.WalletV3,
  });

  const tx = await tokenRoot.methods
    .mint({
      amount: new BigNumber(answers.mintAmount).shiftedBy(Number(decimals)).toFixed(),
      recipient: new Address(answers.tokensOwnerAddress),
      deployWalletValue: locklift.utils.toNano(1),
      notify: false,
      payload: "",
      remainingGasTo: zeroAddress,
    })
    .send({
      from: sender.address,
      amount: locklift.utils.toNano(2),
    });

  console.log(`Mint transaction sent: ${tx.id.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
