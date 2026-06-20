#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

from ecdsa import SECP256k1

_p = SECP256k1.curve.p()
_n = SECP256k1.order
_g = SECP256k1.generator

def modinv(a, m):
    if a % m == 0:
        raise ZeroDivisionError("Делитель не обратим (делится на ноль по модулю)")
    return pow(a, -1, m)

if __name__ == '__main__':
    print("")
    dividend_input = input("      Введите делимое (число в hex): ")
    dividend_N = int(dividend_input, 16)
    
    divider_N = int(input("      Введите делитель (число в dec): "))
    print("")
    dividend_P = _g * dividend_N

    print("      Делимое (Число, dec):")
    print("     ", (dividend_N))
    print("")
    print("Делитель (Число, dec):")
    print(divider_N)
    print("Делитель (hex):")
    print(hex(divider_N))

    mid = modinv(divider_N, _n)
    print("Мультипликативная инверсия делителя (Число):")
    print(mid)
    print("Мультипликативная инверсия делителя (hex):")
    print(hex(mid))
N:
    result_P = dividend_P * mid

    result_N = (dividend_N * mid) % _n
    print("")
    print("      Частное (число, dec):")
    print("     ", (result_N))
    print("")
    print("      Частное (число, hex):")
    print("     ", (hex(result_N)))
    print("")
    _result_NP = _g * result_N



