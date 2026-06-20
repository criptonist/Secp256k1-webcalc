#!/usr/bin/env python3

#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

import subprocess
import sys
import os

def main():
    print("=" * 50)
    print("Алгоритм поиска пути к ключу 0x1")
    print("Порт: 5050")
    print("=" * 50)
    
    try:
        import flask
        import ecdsa
    except ImportError:
        print("Устанавливаем зависимости...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    print("\nЗапуск веб-сервера...")
    print("Сервер будет доступен по адресу: http://localhost:5050")
    print("Для остановки нажмите Ctrl+C")
    print("\n" + "=" * 50)
    
    os.system(f"{sys.executable} app.py")

if __name__ == "__main__":
    main()