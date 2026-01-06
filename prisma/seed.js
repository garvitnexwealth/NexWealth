const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const platforms = ["GROWW", "INDmoney", "ICICI", "HDFC", "KOTAK", "Zerodha"];
  const subAccountTypes = [
    { name: "Groww Indian Stocks", type: 1, baseCurrency: "INR" },
    { name: "INDmoney US Stocks", type: 2, baseCurrency: "USD" },
    { name: "Crypto Basket", type: 3, baseCurrency: "USD" },
    { name: "Mutual Funds", type: 4, baseCurrency: "INR" },
    { name: "Bond Holdings", type: 5, baseCurrency: "INR" },
    { name: "Savings", type: 6, baseCurrency: "INR" },
  ];

  for (const name of platforms) {
    await prisma.platform.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const type of subAccountTypes) {
    await prisma.subAccountType.upsert({
      where: { name: type.name },
      update: { type: type.type, baseCurrency: type.baseCurrency },
      create: type,
    });
  }

  const allPlatforms = await prisma.platform.findMany();
  const allSubAccounts = await prisma.subAccountType.findMany();

  const mapping = [
    ["GROWW", "Groww Indian Stocks"],
    ["INDmoney", "INDmoney US Stocks"],
    ["ICICI", "Savings"],
    ["HDFC", "Savings"],
    ["KOTAK", "Savings"],
  ];

  for (const [platformName, subAccountName] of mapping) {
    const platform = allPlatforms.find((item) => item.name === platformName);
    const subAccount = allSubAccounts.find((item) => item.name === subAccountName);

    if (!platform || !subAccount) continue;

    await prisma.platformSubAccount.upsert({
      where: {
        platformId_subAccountTypeId: {
          platformId: platform.id,
          subAccountTypeId: subAccount.id,
        },
      },
      update: {},
      create: {
        platformId: platform.id,
        subAccountTypeId: subAccount.id,
      },
    });
  }

  console.log("Seeded platforms and sub account types.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
