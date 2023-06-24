const path = require("path");
const fs = require("fs");

const acctDataPath = path.join(__dirname, "scripts", "acctData.json");

// Read the contents of the acctData file
const acctDataJson = fs.readFileSync(acctDataPath, "utf-8");
const acctData = JSON.parse(acctDataJson);

const MY_ACCOUNT_ID = acctData.MY_ACCOUNT_ID;
const MY_PRIVATE_KEY = acctData.MY_PRIVATE_KEY;

console.log("MY_ACCOUNT_ID:", MY_ACCOUNT_ID);
console.log("MY_PRIVATE_KEY:", MY_PRIVATE_KEY);

const filePath = path.join(__dirname, "artifacts", "contracts", "FundMe.sol", "FundMe.json");

// Read the contents of the FundMe.json file
const fundMeJson = fs.readFileSync(filePath, "utf-8");
const bytecode = JSON.parse(fundMeJson).bytecode.replace("0x", "");

fs.access(filePath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error("Unable to read file", err);
  } else {
    console.log("File is readable");
  }
});
