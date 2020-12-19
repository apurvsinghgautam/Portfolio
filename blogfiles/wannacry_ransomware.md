# WannaCry Ransomware


Shadow Brokers is a hacker group that has leaked several NSA hacking tools and scripts to the public. Firstly when they got hands-on NSA tools they tried to auction it in the black market ranging from 2 to 200 Bitcoins, but the auction failed and then they leaked all the dump in public on Github.

The leaked NSA dump contained an exploit for the SMB vulnerability in Windows. The creators of WannaCry ransomware used this exploit to infect the systems worldwide. WannaCry ransomware uses Eternal Blue, a vulnerability of SMB in Windows systems. This vulnerability was used by NSA for spying purposes. Famous hacker group Shadow Brokers leaked NSA dumps containing different tools and scripts used by NSA to the public. The ransomware creators used this vulnerability to target the Windows system and infect the system with their malware.

First, we need to understand that WannaCry is not just simple ransomware that encrypts the computer, but it is also a worm that replicates itself and infects other computers on the same network. Every computer has an IP address associated with it. When a computer is infected with this ransomware, the ransomware gets the subnet mask associated with the IP address of the computer and then searches the whole network using the subnet mask for potential Windows system having SMB turned on and also which is vulnerable to Eternal Blue vulnerability. Then it infects other system and in this way, this ransomware spreads itself over several computers. And, the ransomware infects different networks all around the globe and reached more than 100 countries.

Many hacker groups generally leave their group signature in the exploits they create and spread. But in this case, cybersecurity experts have not yet found any signature related to any hacker group. Though Kaspersky found a link of this ransomware with some South Korean hacking group, but this news is not yet confirmed.

On the other hand, Android, iOS, Blackberry or any other OEM phones will not be affected by this ransomware as they are Linux based systems that don’t have this SMB vulnerability. This vulnerability is only in Windows OSs which are not yet updated with the latest patch provided by Windows.

If you have been infected and your files are also deleted by the ransomware after 6 days then you can recover your files as

- You can use any data recovery software like Recuva or Mini Tool Power Data Recovery which will help you in the recovery of your lost partition or deleted partition.
- If you have a backup of your files on some other drive, then your computer/laptop hard drive can easily be restored by using Windows Backup/Restore Manager.

If you have been infected and your files are not deleted by the ransomware i.e., the 6 days given by the ransomware to delete your files have not been exceeded, then you can do the following to get your data back:

- You can use a Decryption Tool known as WanaKiwi developed by a security researcher named Benjamin Delpy that will help you to decrypt your files but it may not decrypt every file on your system. Also, it works with Windows XP, 7, Vista, 2003 and 2008 Server Editions.
- There is only one option i.e., WanaKiwi, there is no second option, if you want to wait for any security researcher to give any solid method to decrypt files then you can wait for it but your files will be deleted within 6 days. After that, if we get any method to decrypt then you can tell your friends about it who has been attacked by WannaCry recently.