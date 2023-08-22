# FundMe Crowdfunding Platform

![FundMe Logo](./public/fundme.png) <!-- Add a logo image if available -->

## Project Description

**Project Name:** FundMe Crowdfunding Platform

**Summary:** FundMe is a decentralized crowdfunding platform deployed on the Linea network and utilizes the zkp rollup technology of the linea network to interact with the ethereum blockchain. It provides a secure and transparent way for individuals and organizations to create and contribute to fundraising campaigns. The platform enables project owners to showcase their projects, set funding goals, and receive donations from interested individuals (donors). Unlike traditional crowdfunding platforms, FundMe incorporates a method tha uses a DAOlike approach where donors or contributors of a given campaign democratically vet proofs provided by project owners according to preset milestones, ensuring transparency and eliminating the possibility of dishonest use or misappropriation of funds. The platform also implements KYC capabilities using a third-party decentralized identity verification system to ensure compliance with globally accepted anti-money laundering and terrorist financing policies.

## Problem Statement

Crowdfunding, while bringing much-needed relief to individuals and organizations, also has its limitations and negative impacts on society. FundMe addresses the following challenges:

1. Exclusion of certain countries and geographical areas from accessing funds.
2. Risks associated with terrorist financing and Misuse of funds.
3. Low donor engagement throughout the project implementation/execution phase.

### Exclusion of Certain Geographical Areas from Accessing Funds

Many traditional crowdfunding platforms, such as goFundMe, impose restrictions or bans on specific geographical areas, limiting individuals in those regions from accessing much-needed funds. Additionally, the transfer of funds becomes problematic when certain payment channels, like PayPal, are not allowed. FundMe solves these issues by providing a decentralized crowdfunding platform that allows anyone, anywhere, with internet connectivity to connect to the platform and directly transfer funds in cryptocurrency to the beneficiaries' wallets, eliminating the need for payment gateways.

### Terrorism Financing and Misuse of Funds

One of the main concerns in internet crowdfunding is the inability to ensure that funds are used for their intended purposes. FundMe tackles this issue through the following mechanisms:

- **KYC Verification:** FundMe implements a robust Know Your Customer (KYC) verification process, ensured by a third-party application. This process verifies the legitimacy and identity of all participants involved in the crowdfunding platform. By leveraging a decentralized identity management system, FundMe collects and verifies personal information, ensuring compliance with globally accepted anti-money laundering (AML) and counter-terrorism financing (CTF) policies.

- **Proof of Need (PoN) and Proof of Progress (PoP):** The platform requires campaign goals (total amount of money to be raised) to be divided into milestones. The project owner, who initiates a campaign, is required to provide an initial background information like market survey, feasibility study, or any form of evidence and cost estimation for the project's first milestone, that serves as a proof that the project owner has a genuine need for the funds to be raised. This is first evidence is known as the Proof of Need (PoN). After getting approval to withdraw fund for the first milestone, the project owner is subsequently required to provide more information to show the actual use of the funds such as through pictures of receipts or video of the actual project milestone being accomplished, in order to allow donors assess the progress of the project and validate the release of funds for the next milestone to the project owner. This second form of proof is known as the Proof of Progress (PoP).

- **Donor Decision-making:** Potential donors can review the Proof of Need (PoN) or the Proof of Progress (PoP) of a campaign before deciding which campaign to contribute to or whether or not to allow the project owner to have access to the rest of the donated funds respectively. This empowers donors to make informed decisions and ensure their funds align with the intended purposes and are used judiciously.

- **Transparent Milestone Verification:** A project owner can only request to withdraw funds when the funds have reached a preset milestone. At each milestone, the project owner is required to upload video, picture, or document files showcasing how the previous funds were spent. This data which is known as the Proof of Progress(PoP) is stored in an external decentralized database.

- **Campaign DAOlike Vetting:** The campaign DAOlike system (formed by the number of donors contributing to a campaign) can access the off-chain data and vet if the funds were used appropriately. At least 60% of the campaign DAO members must approve for the project owner to withdraw funds.

- **Resolving Milestone:** If a Proof of Progress (PoP) is vetted against, the campaign goes into a state of Resolving Milestone, which lasts for a period of 7 days. During this time, the campaign DAO can decide

 to retrieve their funds. After 7 days, if the campaign DAO has not retrieved the funds, the project owner is given a second chance to upload a genuine Proof of Progress (PoP) and continue accessing the donated funds.

### Low Donor Engagement throughout Project Implementation

In traditional crowdfunding platforms, donors have no means to actively verify that their funds were used for the intended purposes. After making a donation, donors typically have no active role to play throughout the project implementation/execution phase. FundMe addresses this issue by giving donors the power to ensure their funds are used for the intended purposes, mitigating the risk of unintentionally funding a terrorist organization.

## Linea Technology

FundMe utilizes the following technologies:

- **Smart Contract:** The project's smart contract is written in Solidity and interacts with the linea network.
- **Linea Network:** The Linea L2 network acts as the backend for FundMe and performs the following functions:
  - Receives inputs from a third-party KYC application to verify project owners.
  - Stores the funds provided by donors and assigns them as campaign DAOs to verify the appropriate use of funds as stated in the Proof of Need (PoN).
  - Link to the deployed contract on Blockscout
  - https://explorer.goerli.linea.build/tx/0xdf2b91ec8de8019b1407a9f2c55f027a34a9e6e6c59531976c9b3858540f231c
  - Project configured in truffle-config.js file
  - https://github.com/Prince0x01/fundme/blob/main/truffle-config.js


## Stack Used

- Next.js: React framework
- Tailwind CSS: Styling framework
- Flowbite: Pre-built custom Tailwind components
- Web3uikit: Custom components and notifications provider
- Web3.storage: Storing files on IPFS
- Framer Motion: Custom animations
- Fractal.id: Decentralized identity management
- Solidity: Programming language
- Ethereum Networks: Sepolia testnet for deployment and Linear l2 network
- Ethers: Web3 framework
- Infura: Infura RPC endpoints
- Truffle: Truffle dashboard,truffle config file and migrations for contract compilation and deployment
- Metamask: Metamask SDK and
- Metamask Snaps: Transaction insight snaps


## Team Members

The FundMe project is developed by a dedicated team of individuals:

1) Princewill Ogolo
   - Pseudonym: Prince0x01
   - GitHub: [https://github.com/Prince0x01/](https://github.com/prince0x01)
   - Email: ogoloprince4@gmail.com

2) Emmanuel Amieye
   - Pseudonym: Emmy j #1136
   - GitHub: [https://github.com/code-xiake](https://github.com/code-xiake)
   - Email: emmanuelamieye4@gmail.com

3) Anderson Osayerie
   - Pseudonym: andemosa
   - GitHub: [https://github.com/andemosa](https://github.com/andemosa)
   - Email: osayerieanderson@gmail.com
