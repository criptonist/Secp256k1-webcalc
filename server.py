#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#


from ecdsa.curves import SECP256k1
from ecdsa.ellipticcurve import Point
from ecdsa import SigningKey, VerifyingKey
from flask import Flask, request, jsonify
from flask_cors import CORS
from Code19 import private_key_to_public_key, hash160, base58_check_encode, create_p2sh_address
import hashlib
import re
import bech32
import base58
import random

app = Flask(__name__)
CORS(app)

BECH32M_CONST = 0x2bc830a3
BECH32_CONST = 1

def bech32_polymod(values):

    generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    chk = 1
    for value in values:
        top = chk >> 25
        chk = (chk & 0x1ffffff) << 5 ^ value
        for i in range(5):
            chk ^= generator[i] if ((top >> i) & 1) else 0
    return chk

def bech32_hrp_expand(hrp):

    return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]

def bech32_create_checksum(hrp, data, bech32m=False):

    values = bech32_hrp_expand(hrp) + data
    const = BECH32M_CONST if bech32m else BECH32_CONST
    polymod = bech32_polymod(values + [0, 0, 0, 0, 0, 0]) ^ const
    return [(polymod >> 5 * (5 - i)) & 31 for i in range(6)]

def bech32_encode(hrp, data, bech32m=False):

    combined = data + bech32_create_checksum(hrp, data, bech32m)
    return hrp + '1' + ''.join([bech32.CHARSET[d] for d in combined])

def private_key_to_taproot_pubkey(priv_key_hex):
    try:
        priv_int = int(priv_key_hex, 16)
        
        sk = SigningKey.from_secret_exponent(priv_int, curve=SECP256k1)
        
        vk = sk.verifying_key
        
        x_coord = vk.pubkey.point.x()
        
        x_bytes = x_coord.to_bytes(32, byteorder='big')
        
        return x_bytes
    except Exception as e:
        raise ValueError(f"Failed to generate Taproot pubkey: {str(e)}")

def create_taproot_address(pubkey_xonly):
    try:
        witness_version = 1
        
        data_5bit = bech32.convertbits(pubkey_xonly, 8, 5, True)
        if data_5bit is None:
            raise ValueError("Failed to convert to 5-bit words")
        
        combined = [witness_version] + data_5bit
        
        address = bech32_encode("bc", combined, bech32m=True)
        
        return address
    except Exception as e:
        raise ValueError(f"Failed to create Taproot address: {str(e)}")

def create_bech32_address(witness_program, version=0):
    try:
        data_5bit = bech32.convertbits(witness_program, 8, 5, True)
        if data_5bit is None:
            raise ValueError("Failed to convert to 5-bit words")
        
        combined = [version] + data_5bit
        address = bech32_encode("bc", combined, bech32m=False)
        
        return address
    except Exception as e:
        raise ValueError(f"Failed to create bech32 address: {str(e)}")

def create_p2wsh_address(witness_program_32):
    try:
        return create_bech32_address(witness_program_32, version=0)
    except Exception as e:
        raise ValueError(f"Failed to create P2WSH address: {str(e)}")

@app.route("/")
def index():
    return jsonify({
        "status": "online",
        "service": "Bitcoin Address Generator",
        "endpoint": "/btc (POST)",
        "usage": 'Send POST with {"priv": "your_private_key_hex"}',
        "note": "Private key should be hex string (64 characters max)"
    })

@app.route("/btc", methods=["POST", "OPTIONS"])
def btc():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        if not data or "priv" not in data:
            return jsonify({"success": False, "error": "Missing 'priv' field"}), 400
        
        priv = str(data["priv"]).strip()
        
        if not priv:
            return jsonify({"success": False, "error": "Empty private key"}), 400
        
        if priv.lower().startswith('0x'):
            priv = priv[2:]
        
        if not re.match(r'^[0-9a-fA-F]+$', priv):
            return jsonify({"success": False, "error": "Invalid hex format. Use only 0-9, a-f, A-F characters"}), 400

        if len(priv) > 64:
            return jsonify({"success": False, "error": "Private key too long (max 64 hex chars)"}), 400
        
        try:
            if len(priv) % 2 != 0:
                priv = '0' + priv
            priv_bytes = bytes.fromhex(priv)
        except ValueError as e:
            return jsonify({"success": False, "error": f"Invalid hex data: {str(e)}"}), 400

        pub_u = private_key_to_public_key(priv, compressed=False)
        h160_u = hash160(pub_u)
        legacy_address_u = base58_check_encode(b'\x00', h160_u).decode()
        
        pub_c = private_key_to_public_key(priv, compressed=True)
        h160_c = hash160(pub_c)
        legacy_address_c = base58_check_encode(b'\x00', h160_c).decode()
        
        sha256_pubkey_u = hashlib.sha256(pub_u).digest()
        sha256_pubkey_c = hashlib.sha256(pub_c).digest()

        sha256_hash_u = hashlib.sha256(sha256_pubkey_u).digest()
        sha256_hash_c = hashlib.sha256(sha256_pubkey_c).digest()
        
        prefix_hash160_u = b'\x00' + h160_u
        checksum_u = hashlib.sha256(hashlib.sha256(prefix_hash160_u).digest()).digest()[:4]
        full_payload_u = prefix_hash160_u + checksum_u

        prefix_hash160_c = b'\x00' + h160_c
        checksum_c = hashlib.sha256(hashlib.sha256(prefix_hash160_c).digest()).digest()[:4]
        full_payload_c = prefix_hash160_c + checksum_c
        
        witness_program = h160_c
        redeem_script = b'\x00\x14' + witness_program
        redeem_script_hash = hash160(redeem_script)
        segwit_address_result = create_p2sh_address(redeem_script_hash)

        if isinstance(segwit_address_result, bytes):
            segwit_address = segwit_address_result.decode()
        else:
            segwit_address = segwit_address_result
        
        p2wpkh_address = create_bech32_address(witness_program, version=0)
        
        p2wsh_address = create_p2wsh_address(sha256_pubkey_c)
        
        taproot_pubkey = private_key_to_taproot_pubkey(priv)
        p2tr_address = create_taproot_address(taproot_pubkey)

        return jsonify({
            "success": True,
            "input": priv,
            "uncompressed": {
                "pubkey": pub_u.hex(),
                "address": legacy_address_u,
                "x_coordinate": pub_u[1:33].hex() if len(pub_u) >= 65 else "",
                "y_coordinate": pub_u[33:65].hex() if len(pub_u) >= 65 else "",
                "hash160": h160_u.hex(),
                "sha256_pubkey": sha256_pubkey_u.hex(),
                "sha256_hash": sha256_hash_u.hex(),
                "prefix_hash160": prefix_hash160_u.hex(),
                "prefixed_checksum": full_payload_u.hex()
            },
            "compressed": {
                "pubkey": pub_c.hex(),
                "address": legacy_address_c,
                "hash160": h160_c.hex(),
                "sha256_pubkey": sha256_pubkey_c.hex(),
                "sha256_hash": sha256_hash_c.hex(),
                "prefix_hash160": prefix_hash160_c.hex(),
                "prefixed_checksum": full_payload_c.hex()
            },
            "segwit_p2sh": {
                "redeem_script": redeem_script.hex(),
                "redeem_script_hash": redeem_script_hash.hex(),
                "address": segwit_address
            },
            "p2wpkh": {
                "witness_program": witness_program.hex(),
                "address": p2wpkh_address
            },
            "p2wsh": {
                "sha256": sha256_pubkey_c.hex(),
                "address": p2wsh_address
            },
            "p2tr": {
                "pubkey": taproot_pubkey.hex(),
                "address": p2tr_address
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/search-plus", methods=["POST", "OPTIONS"])
def search_plus():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        if not data or "priv" not in data:
            return jsonify({"success": False, "error": "Missing 'priv' field"}), 400
        
        priv = str(data["priv"]).strip()
        bits = int(data.get("bits", 4))
        
        if not priv:
            return jsonify({"success": False, "error": "Empty private key"}), 400
        
        if priv.lower().startswith('0x'):
            priv = priv[2:]
        
        if not re.match(r'^[0-9a-fA-F]+$', priv):
            return jsonify({"success": False, "error": "Invalid hex format. Use only 0-9, a-f, A-F characters"}), 400
        
        if bits < 1 or bits > 4:
            return jsonify({"success": False, "error": "Bits must be between 1 and 4"}), 400
        
        from ecdsa.curves import SECP256k1
        from ecdsa.ellipticcurve import Point
        
        curve = SECP256k1.curve
        G = SECP256k1.generator
        n = SECP256k1.order
        p = curve.p()
        
        priv_int = int(priv, 16) % n
        
        P = priv_int * G
        
        total_count = 1 << bits
        try:
            invcount = pow(total_count, -1, n)
        except ValueError:
            return jsonify({"success": False, "error": "Cannot compute modular inverse"}), 400
        
        Q0 = invcount * P
        Q0_priv = (invcount * priv_int) % n
        R = invcount * G
        neg_R = Point(curve, R.x(), (-R.y()) % p)
        
        points = []
        Q_current = Q0
        
        for i in range(total_count):
            Q_i_priv = (Q0_priv - i * invcount) % n
            points.append({
                "index": i,
                "x": format(Q_current.x(), '064x') if Q_current.x() else "inf",
                "y": format(Q_current.y(), '064x') if Q_current.y() else "inf",
                "private_key": format(Q_i_priv, '064x')
            })
            Q_current = Q_current + neg_R
        
        return jsonify({
            "success": True,
            "input": priv,
            "bits": bits,
            "total_count": total_count,
            "original_pubkey": {
                "x": format(P.x(), '064x') if P.x() else "",
                "y": format(P.y(), '064x') if P.y() else ""
            },
            "invcount": format(invcount, 'x'),
            "Q0": {
                "x": format(Q0.x(), '064x') if Q0.x() else "",
                "y": format(Q0.y(), '064x') if Q0.y() else ""
            },
            "constants": {
                "n": format(n, '064x'),
                "p": format(p, '064x')
            },
            "points": points
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/ec-division", methods=["POST", "OPTIONS"])
def ec_division():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        if not data or "dividend" not in data or "divider" not in data:
            return jsonify({"success": False, "error": "Missing 'dividend' or 'divider' field"}), 400
        
        dividend_hex = str(data["dividend"]).strip()
        divider_hex = str(data["divider"]).strip()
        
        if not dividend_hex or not divider_hex:
            return jsonify({"success": False, "error": "Empty dividend or divider"}), 400
        
        if dividend_hex.lower().startswith('0x'):
            dividend_hex = dividend_hex[2:]
        
        if divider_hex.lower().startswith('0x'):
            divider_hex = divider_hex[2:]
        
        if not re.match(r'^[0-9a-fA-F]+$', dividend_hex):
            return jsonify({"success": False, "error": "Invalid hex format for dividend"}), 400
        
        if not re.match(r'^[0-9a-fA-F]+$', divider_hex):
            return jsonify({"success": False, "error": "Invalid hex format for divider"}), 400
        
        from ecdsa.curves import SECP256k1
        curve = SECP256k1.curve
        G = SECP256k1.generator
        n = SECP256k1.order
        
        dividend_int = int(dividend_hex, 16) % n
        divider_int = int(divider_hex, 16) % n
        
        if divider_int == 0:
            return jsonify({"success": False, "error": "Divider cannot be zero"}), 400
        
        try:
            inverse_divider = pow(divider_int, -1, n)
        except ValueError:
            return jsonify({"success": False, "error": "Cannot compute modular inverse of divider"}), 400
        
        P = dividend_int * G
        
        result_point = inverse_divider * P
        
        result_scalar = (dividend_int * inverse_divider) % n
        
        def format_coordinate(value):
            if value is None:
                return "0" * 64
            return format(value, '064x')
        
        return jsonify({
            "success": True,
            "dividend": dividend_hex,
            "divider": divider_hex,
            "divider_dec": str(divider_int),
            "modulus_n": format(n, '064x'),
            "inverse_dec": str(inverse_divider),
            "inverse_hex": format(inverse_divider, '064x'),
            "original_point": {
                "x": format_coordinate(P.x()),
                "y": format_coordinate(P.y())
            },
            "result_point": {
                "x": format_coordinate(result_point.x()),
                "y": format_coordinate(result_point.y())
            },
            "result_scalar_dec": str(result_scalar),
            "result_scalar_hex": format(result_scalar, '064x'),
            "result_decimal": str(result_scalar)
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/path-search", methods=["POST", "OPTIONS"])
def path_search():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        if not data or "priv" not in data:
            return jsonify({"success": False, "error": "Missing 'priv' field"}), 400
        
        priv = str(data["priv"]).strip()
        algorithm = data.get("algorithm", "even")
        
        if not priv:
            return jsonify({"success": False, "error": "Empty private key"}), 400
        
        if priv.lower().startswith('0x'):
            priv = priv[2:]
        
        if not re.match(r'^[0-9a-fA-F]+$', priv):
            return jsonify({"success": False, "error": "Invalid hex format. Use only 0-9, a-f, A-F characters"}), 400
        
        from ecdsa.curves import SECP256k1
        n = SECP256k1.order
        
        priv_int = int(priv, 16) % n
        
        if priv_int <= 0:
            return jsonify({"success": False, "error": "Key must be greater than 0"}), 400
        
        def truncate_key(key_int):
            key1 = key_int >> 1
            key2 = (key_int >> 1) | (1 << 255)
            return [
                {"key": format(key1, 'x'), "value": key1, "is_even": key1 % 2 == 0},
                {"key": format(key2, 'x'), "value": key2, "is_even": key2 % 2 == 0}
            ]
        
        path = []
        current_key = priv_int
        step = 0
        max_steps = 255
        
        path.append({
            "step": step,
            "key_hex": format(current_key, 'x'),
            "is_even": current_key % 2 == 0,
            "choice": "original"
        })
        
        step = 1
        
        while current_key != 1 and step <= max_steps:
            candidates = truncate_key(current_key)
            
            if algorithm == "even":
                candidates.sort(key=lambda x: x["value"])
                chosen = candidates[0]
                choice_text = "smallest"
            else:
                chosen = random.choice(candidates)
                choice_text = "random"
            
            current_key = chosen["value"]
            
            path.append({
                "step": step,
                "key_hex": format(current_key, 'x'),
                "is_even": chosen["is_even"],
                "choice": choice_text
            })
            
            step += 1
        
        heatmap_data = {}
        for step_data in path[1:]:
            first_char = step_data["key_hex"][0].upper() if step_data["key_hex"] else "0"
            if first_char not in heatmap_data:
                heatmap_data[first_char] = 0
            heatmap_data[first_char] += 1
        
        heatmap_array = []
        hex_digits = "0123456789ABCDEF"
        for hex_digit in hex_digits:
            count = heatmap_data.get(hex_digit, 0)
            if count > 0:
                heatmap_array.append({
                    "hex": hex_digit,
                    "count": count,
                    "percentage": round((count / (len(path) - 1)) * 100, 1) if len(path) > 1 else 0
                })
        
        return jsonify({
            "success": True,
            "input_key": priv,
            "algorithm": algorithm,
            "path": path,
            "total_steps": len(path) - 1,
            "reached_one": current_key == 1,
            "heatmap": heatmap_array,
            "stats": {
                "unique_hex": len(heatmap_array),
                "max_count": max(heatmap_data.values()) if heatmap_data else 0,
                "total_steps_analyzed": len(path) - 1
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/health", methods=["GET", "OPTIONS"])
def health():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    return jsonify({
        "status": "healthy",
        "service": "Bitcoin Address Generator",
        "timestamp": "server is running"
    }), 200

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"pong": True}), 200

if __name__ == "__main__":
    print("Starting Bitcoin Address Generator Server...")
    print("Server URL: http://127.0.0.1:5000")
    print("API endpoints:")
    print("  POST /btc           - Bitcoin Address Generator")
    print("  POST /search-plus   - Search Plus Keys")
    print("  POST /ec-division   - EC Division")
    print("  POST /path-search   - Path Search Algorithm (NEW!)")
    print("  GET  /health        - Health check")
    print("  GET  /ping          - Simple ping")
    print("\nServer is running in background...\n")
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)