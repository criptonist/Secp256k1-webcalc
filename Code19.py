#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

import hashlib
import ecdsa
import base58
import bech32

def private_key_to_public_key(priv_key_hex, compressed=False):
    if len(priv_key_hex) % 2 != 0:
        priv_key_hex = "0" + priv_key_hex
    priv_key_hex = priv_key_hex.zfill(64)
    priv_key_bytes = bytes.fromhex(priv_key_hex)
    sk = ecdsa.SigningKey.from_string(priv_key_bytes, curve=ecdsa.SECP256k1)
    vk = sk.verifying_key
    if compressed:
        pub_key_bytes = vk.to_string()
        x = pub_key_bytes[:32]
        y = pub_key_bytes[32:]
        prefix = b'\x02' if (y[-1] % 2 == 0) else b'\x03'
        return prefix + x
    else:
        return b'\x04' + vk.to_string()


def hash160(data):
    sha = hashlib.sha256(data).digest()
    ripemd = hashlib.new('ripemd160', sha).digest()
    return ripemd

def sha256(data):
    return hashlib.sha256(data).digest()

def base58_check_encode(prefix, payload):
    extended = prefix + payload
    checksum = hashlib.sha256(hashlib.sha256(extended).digest()).digest()[:4]
    result = extended + checksum
    return base58.b58encode(result)

def create_p2pkh_address(pub_key_hash):
    return base58_check_encode(b'\x00', pub_key_hash)

def create_p2sh_address(redeem_script_hash):
    return base58_check_encode(b'\x05', redeem_script_hash)

def create_bech32_address(witness_program, version=0):
    if version == 1:
        return bech32.encode("bc", version, witness_program)
    else:
        return bech32.encode("bc", version, witness_program)

def private_key_to_taproot_pubkey(priv_key_hex):
    compressed_pubkey = private_key_to_public_key(priv_key_hex, compressed=True)
    
    xonly_pubkey = compressed_pubkey[1:]
    
    return xonly_pubkey

def create_taproot_address(pubkey_xonly):
    witness_program = pubkey_xonly
    
    taproot_address = create_bech32_address(witness_program, version=1)
    
    return taproot_address

def calculate_address_interactive(priv_key_hex):
    print("")
    print("                                                   LEGACY (P2PKH)")
    print("                                                   ===============")

    pub_key_compressed = private_key_to_public_key(priv_key_hex, compressed=True)
    print("    Pubkey (Compressed):           ", pub_key_compressed.hex())

    pub_key_hash160 = hash160(pub_key_compressed)
    print("    Hash160 of pubkey:             ", pub_key_hash160.hex())

    legacy_address = create_p2pkh_address(pub_key_hash160)
    print("    Bitcoin Address (Legacy P2PKH):", legacy_address.decode())

    print("\n                                                   SEGWIT (P2SH-P2WPKH)")
    print("                                                   ====================")

    witness_program = pub_key_hash160
    redeem_script = b'\x00\x14' + witness_program
    
    print("    Witness program (hash160):     ", witness_program.hex())
    print("    Redeem script:                 ", redeem_script.hex())
    
    redeem_script_hash = hash160(redeem_script)
    print("    Hash160 of redeem script:      ", redeem_script_hash.hex())
    
    
    segwit_address = create_p2sh_address(redeem_script_hash)
    print("    Bitcoin Address (SegWit P2SH): ", segwit_address.decode())
    print("\n                                                   NATIVE SEGWIT (BECH32)")
    print("                                                   =======================")
    
    
    witness_program_for_bech32 = pub_key_hash160
    
    print("    Witness program (hash160):     ", witness_program_for_bech32.hex())
    
    bech32_address = create_bech32_address(witness_program_for_bech32, version=0)
    print("    Bitcoin Address (Native SegWit):", bech32_address)
    print("\n                                                   TAPROOT (P2TR)")
    print("                                                   ===============")
    
    taproot_pubkey = private_key_to_taproot_pubkey(priv_key_hex)
    print("    Taproot Pubkey (x-only):       ", taproot_pubkey.hex())
       
    taproot_address = create_taproot_address(taproot_pubkey)
    print("    Bitcoin Address (Taproot P2TR):", taproot_address)
    print("\n" + "="*70)
    print("Итоговые адреса для приватного ключа:", priv_key_hex)
    print("="*70)
    print(f"Legacy (P2PKH)     : {legacy_address.decode()}")
    print(f"SegWit (P2SH)      : {segwit_address.decode()}")
    print(f"Native SegWit      : {bech32_address}")
    print(f"Taproot (P2TR)     : {taproot_address}")
    print("="*70)

if __name__ == "__main__":
    print("")
    priv_key_hex = input("    Enter privatekey (hex): ")
    calculate_address_interactive(priv_key_hex)