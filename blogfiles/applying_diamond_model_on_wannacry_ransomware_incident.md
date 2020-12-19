# Applying Diamond Model on WannaCry Ransomware Incident

Tags: LinkedIn Article, Portfolio Blogs
URL: https://www.linkedin.com/pulse/applying-diamond-model-wannacry-ransomware-incident-gautam/

## Introduction

The cyber incident that we will be discussing is the WannaCry ransomware attack. This was a worldwide cyberattack that started in May 2017. This ransomware targeted Microsoft Windows operating system using EternalBlue, an exploit discovered by NSA, that exploits a vulnerability in Microsoft’s SMB (Server Message Block) protocol. EternalBlue exploit was stolen and leaked from USA’s National Security Agency (NSA) by Shadow Brokers group in Apr 2017. This ransomware encrypted the data and installed a backdoor onto infected systems and demanded ransom payments in Bitcoin cryptocurrency.

Microsoft had already released patches to close this exploit, but most of the organizations did not update their systems. WannaCry only affected those computers that had this vulnerability. Although the attack was stopped within a few days due to emergency patches by Microsoft that were released after the attack, it affected more than 200,000 computers across 150 countries with total damages ranging from hundreds of millions to billions of dollars.

## Case Analysis with Diamond Model

In the diamond model, four main components are Adversary, Capability, Infrastructure, and the Victim.

### Victim[](https://apurvsinghgautam.me/blogfiles/applying_diamond_model_on_wannacry_ransomware_incident.html#victim)

The victim of this ransomware attack was mainly the organizations that did not install the April 2017 security patch for EternalBlue or were running unsupported or out-of-band systems like Windows XP, Windows Server 2003. According to Kaspersky Lab, the four most affected countries were Russia, Ukraine, India, and Taiwan.[3]

The victim personae included Health Care industry including mainly U.K.’s National Health Service (NHS), U.S. Hospitals, Automobile industry including Nissan, Honda, Renault, Universities in China, FedEx, Government systems in India, Chinese Police, Russia including their banks, telecom providers, railway systems and the interior ministry.

The victim assets included the systems that had a vulnerability in the SMB protocol (CVE-2017-0145) that was exploited by EternalBlue exploit.

### Capability

WannaCry is a ransomware crypto worm that targets Windows systems by encrypting data and demanding ransom payments of $300-$500 in Bitcoin. The worm is also known as WannaCrypt, Wana Decrypt0r 2.0, and Wanna Decryptor. It is considered a network worm as it propagates to other systems and infects them if they have the same SMB vulnerability.

On reaching a system, it uses EternalBlue exploit using port 445 (SMB) to gain access and the DoublePulsar tool to install a backdoor and execute a copy of itself. WannaCry versions 0, 1, and 2 were created using Microsoft Visual C++ 6.0.

EternalBlue is an exploit of Windows’ Server Message Block (SMB) protocol that was discovered by the NSA and stolen and released by Shadow Brokers. DoublePulsar is a backdoor tool that is used by WannaCry to install itself on any system. The Shadow Brokers group released these both in April 2017.

WannaCry, upon execution, unlike other ransomware strains, does not employ hibernation as a sandbox evasion technique. In a couple of seconds, the ransomware encrypts all directory contents on the system except those in the SystemRoot and Program Files. It does not encrypt the *.exe or *.dll file extensions. The product of the encryption process files with the *.WNCRY extension. The ransomware comes with an implanted master RSA public key whose corresponding the attacker retains the private key. Upon infection, the ransomware uses a secure PRNG function CryptGenRandom from the operating system CryptoAPI to generate a 2048-bit sub-RSA pair for use by the cryptographic service provider (CSP). The public key from this sub-pair is exported to 00000000.pky in unencrypted form. The private key thereof is exported and written to 00000000.eky after being encrypted by the implanted master RSA public key using the CryptEncrypt function. Further, a 128-bit AES key is generated in Cipher Block Chaining (CBC) mode for encryption of the victim’s target files, with a unique key per file. These symmetric keys are then encrypted by the earlier public key from the sub-pair which was exported to 00000000.pky.[4]

In total, the ransomware operates on four encryption keys: one RSA public key from the master key pair, two keys from the payload-generated sub-RSA pair, and one AES symmetric key. The AES key is only encrypted by the payload-generated sub-RSA public key upon completion of encrypting the victim’s targeted file extensions.

### Infrastructure

According to the report by Malwarebytes, the ransomware was spread via an operation that hunts down vulnerable public facing SMB ports. It then uses alleged NSA-leaked EternalBlue exploit to get on the network and then the DoublePulsar exploit to establish persistence and allow for the installation of the WannaCry Ransomware. Just a few thousand machines could have yielded a widespread distribution of WannaCry across the world.[2] This can constitute Type I Infrastructure as the attackers spread the initial attack by searching the vulnerable systems.

According to a report by Foxit, the ransomware spread was spread by leveraging social engineering attacks via an email containing a link or a PDF file with payload, which, if clicked, installs WannaCry on the targeted system. This can constitute Type II Infrastructure as compromised accounts sent the email as in the typical case of spam emails.

EternalBlue allows malicious code to spread through structures set up to share files between systems. In this way, the ransomware spread so fast using the loophole in the file-sharing protocol. The ransomware tried to connect to a domain initially, which was discovered by a researcher. The domain was hxxp://www[.]iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea[.]com.[1] The ransomware first tries to connect the following domain, and if not found, then it goes on infecting the system. The domain constitutes Type I Infrastructure, probably owned by the attacker.

### Adversary

Several security groups and researchers analyzed the ransomware. Linguistic analysis of the ransom notes indicated the authors were fluent in Chinese and proficient in English. According to an investigation by the FBI’s Cyber Behavioral Analysis Center, the computer that created the ransomware files had Hangul language fonts installed. Metadata in the file also indicated that the machines were set to UTC+09:00, used in Korea.

A Google security researcher, Kaspersky Lab, and Symantec all three found code similarities between WannaCry ransomware and a previous malware that was used by Lazarus Group, in Sony hack and Bangladesh bank heist, that was linked to North Korea.

On 18 Dec. 2017, the United States Government formally announced that it publicly considers North Korea to be the main culprit behind the WannaCry attack. Along with the US, Canada, New Zealand, Japan, and the United Kingdom also agreed with the United States’ assessment of the evidence that links the attack to North Korea.

On 6 Sept. 2018, the U.S. Department of Justice (DoJ) announced formal charges against Park Jin-hyok for involvement in the Sony Pictures hack of 2014 and WannaCry attack, among other activities. The DoJ contended that Park was a North Korean hacker working as a part of a team of experts for the North Korean Reconnaissance General Bureau.

We move on to talk about the Social-Political meta feature and Technology meta feature of the extended Diamond Model.

### Social-Political Meta Feature

From the analysis of the WannaCry ransomware, it can be stated that the intent of the attackers was monetary gain. They were not behind the data of any organization. The ransomware demanded $300-$500 in Bitcoins. As of June 2017, after the attack had subsided, a total of 327 payments by the victims totaling US$130,634.77 had been transferred to the attackers using the bitcoin addresses stated in the ransomware. Even after the payment, the victims did not get back their data, and this encourages more of such ransomware campaigns because of the high revenues. According to cyber-risk-modeling firm Cyence, economic losses from the cyber-attack could reach up to US$4 billion

### Technology Meta Feature

From the analysis of the WannaCry ransomware, it uses technologies like resolving domain over HTTP (the initial domain check), I.P., and File Sharing protocol to spread across a network searching for SMB vulnerability, utilizing mail servers to propagate spam emails containing the ransomware.

Activity Thread in this cyber incident would be as:

Event 1 – The adversary conducts searches for all public-facing vulnerable SMB ports. (Actual)

Event 2 – The adversary performs social engineering methods like sending phishing emails or conducting spam campaigns to lure the victims into opening an email containing WannaCry ransomware. (Hypothesis)

Event 3 – As soon as the ransomware is opened, it tried to lookup for a specific domain. If the domain is not found, it starts with the attack. (Actual)

Event 4 – The ransomware encrypts all the files on the host machine except system files and pops up a dialog having ransom money and bitcoin address to be paid for the decryption of files. (Actual)

Event 5 – The ransomware moves on to scanning other systems on the network for vulnerable SMB systems and, in this way, spreads across many systems. (Actual)

## Case Analysis with Policy

This type of ransomware attack happens mainly because of the lack of regular updates of the systems within an organization. This problem is best addressed at the Organization level. If there will be proper policy creation and policy checks within an organization for maintaining, patching, and updating every system within that organization, then any kind of ransomware will not be able to gain access to the systems.

In this case, Microsoft already had issued the SMB vulnerability patch in April 2017 security update. Still, most of the organizations did not update their systems to the latest patch, and these were the ones most affected by WannaCry ransomware.

One other angle to this ransomware can be addressed at the National level. It would be responsible for disclosure by the Government (NSA) to Microsoft about the SMB vulnerability. If they disclosed about it beforehand, it could have allowed Microsoft to release patches before the Shadow Brokers group stole and released it in the wild to the public. Many independent researchers claim that there was some liability on the part of the U.S. intelligence services.

In the end, it mostly comes down to the organization’s role in securing its system and Industry’s role in identifying vulnerability in their software or operating system.

## Conclusion

There are still various versions of WannaCry ransomware being spotted in the wild. In 2018 as well as 2019, many users reported being sent a phishing email claiming to be the developers of WannaCry. The email threatened the victims to destroy their data unless they sent 0.1 BTC to the bitcoin address of the hackers.[3]

The ransomware industry will keep on growing, the only possible solution to this is regular updates of systems by the organizations, and proper vulnerability discovery and disclosure by the industries.

## References

[1]: “WannaCry Ransomware: Everything You Need To Know Immediately.” The Hacker News, 15 Mar.15 Mar 2018, [https://thehackernews.com/2017/05/how-to-wannacry-ransomware.html](https://thehackernews.com/2017/05/how-to-wannacry-ransomware.html).

[2]: McNeil, Adam, et al. “How Did the WannaCry Ransomware Spread?” Malwarebytes Labs, 26 Sept. 2019, [https://blog.malwarebytes.com/cybercrime/2017/05/how-did-wannacry-ransomworm-spread/](https://blog.malwarebytes.com/cybercrime/2017/05/how-did-wannacry-ransomworm-spread/).

[3]: “WannaCry Ransomware Attack.” Wikipedia, Wikimedia Foundation, 4 Dec. 2019, [https://en.wikipedia.org/wiki/WannaCry_ransomware_attack](https://en.wikipedia.org/wiki/WannaCry_ransomware_attack).

[4]: Zimba, Aaron & Simukonda, Luckson & Chishimba, Mumbi. (2017). Demystifying Ransomware Attacks: Reverse Engineering and Dynamic Malware Analysis of WannaCry for Network and Information Security. Zambia ICT Journal. 1. 35 - 40. 10.33260/zictjournal.v1i1.19.

[5]: Al-Mohannadi, Hamad, et al. “Cyber-Attack Modeling Analysis Techniques: An Overview.” 2016 IEEE 4th International Conference on Future Internet of Things and Cloud Workshops (FiCloudW), 2016, doi:10.1109/w-ficloud.2016.29.

[6]: Caltagirone, Sergio, Andrew Pendergast, and Christopher Betz. The diamond model of intrusion analysis. Center For Cyber Intelligence Analysis and Threat Research Hanover Md, 2013.