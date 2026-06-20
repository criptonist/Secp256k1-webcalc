#!/usr/bin/env python3

#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

from Code19 import calculate_address_interactive

if __name__ == "__main__":
    print("")
    priv_key_hex = input("    Enter privatekey (hex): ")
    calculate_address_interactive(priv_key_hex)