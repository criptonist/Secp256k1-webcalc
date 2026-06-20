#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

import sys
import random
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

try:
    from ecdsa.curves import SECP256k1
    from ecdsa.ellipticcurve import Point
    ECDSA_AVAILABLE = True
except ImportError as e:
    ECDSA_AVAILABLE = False

n = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141

def to_hex(n_val):
    if n_val is None:
        return "inf"
    hex_str = format(n_val, 'x')
    return hex_str

def truncate_key_by_one_bit(priv_key_hex):
    priv_key = int(priv_key_hex, 16)
    
    key1 = priv_key >> 1
    key2 = (priv_key >> 1) | (1 << 255)
    
    return [
        {"key": to_hex(key1), "value": key1, "is_even": key1 % 2 == 0},
        {"key": to_hex(key2), "value": key2, "is_even": key2 % 2 == 0}
    ]

def find_path_to_one_even(priv_key_hex, max_steps=255):
    if not ECDSA_AVAILABLE:
        raise Exception("Библиотека ecdsa не установлена")
    
    current_key = int(priv_key_hex, 16)
    path = []
    step_count = 0
    
    path.append({
        "step": step_count,
        "key_hex": to_hex(current_key),
        "is_even": current_key % 2 == 0,
        "choice": "исходный"
    })
    
    step_count = 1
    
    while current_key != 1 and step_count <= max_steps:
        candidates = truncate_key_by_one_bit(to_hex(current_key))

        candidates.sort(key=lambda x: x["value"])
        chosen = candidates[0]
        
        current_key = chosen["value"]
        
        if len(candidates) == 2:
            if chosen["value"] < candidates[1]["value"]:
                choice_text = "наименьший"
            else:
                choice_text = "равный"
        else:
            choice_text = "единственный"
        
        path.append({
            "step": step_count,
            "key_hex": to_hex(current_key),
            "is_even": current_key % 2 == 0,
            "choice": choice_text
        })
        
        step_count += 1
    
    return path

def find_path_to_one_random(priv_key_hex, max_steps=255):
    if not ECDSA_AVAILABLE:
        raise Exception("Библиотека ecdsa не установлена")
    
    current_key = int(priv_key_hex, 16)
    path = []
    step_count = 0
    
    path.append({
        "step": step_count,
        "key_hex": to_hex(current_key),
        "is_even": current_key % 2 == 0,
        "choice": "исходный"
    })
    
    step_count = 1

    while current_key != 1 and step_count <= max_steps:
        candidates = truncate_key_by_one_bit(to_hex(current_key))
        chosen = random.choice(candidates)
        current_key = chosen["value"]
        
        path.append({
            "step": step_count,
            "key_hex": to_hex(current_key),
            "is_even": current_key % 2 == 0,
            "choice": "случайный"
        })
        
        step_count += 1
        
        if current_key == 1:
            break
    
    return path

def process_key(priv_key_hex):
    if not ECDSA_AVAILABLE:
        return {"error": "Библиотека ecdsa не установлена. Установите: pip install ecdsa"}
    
    priv_key_hex = priv_key_hex.strip().lower()
    
    priv_key_hex = priv_key_hex.lstrip('0')
    if priv_key_hex == '':
        priv_key_hex = '0'
    
    try:
        key_int = int(priv_key_hex, 16)
        if key_int <= 0 or key_int >= n:
            return {"error": "Ключ вне диапазона secp256k1"}
    except:
        return {"error": "Неверный HEX формат"}
    
    even_path = find_path_to_one_even(priv_key_hex, 255)
    random_path = find_path_to_one_random(priv_key_hex, 255)
    
    return {
        "input_key": priv_key_hex,
        "even_path": even_path,
        "random_path": random_path,
        "success": True
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--web":
            print("Для запуска веб-сервера используйте: python app.py")
        else:
            result = process_key(sys.argv[1])
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(json.dumps(result, indent=2))
    else:
        print("Используйте с веб-интерфейсом или укажите ключ как аргумент")