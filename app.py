#-------------------------------------------------------------------------------------#
#----------------------------------- CRIPTONIST.COM ----------------------------------#
#------------------------------ Channel t.me/CRIPTONIST ------------------------------#
#-------------------------------------------------------------------------------------#
#--Thank you for using my software for your calculations. I hope you find it useful.--#
#--The software does not collect data and operates exclusively on the user's device.--#
#-------------------------------------------------------------------------------------#

from flask import Flask, render_template, request, jsonify
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')

print("=" * 60)
print("СЕРВЕР АЛГОРИТМА ПОИСКА КЛЮЧЕЙ")
print("=" * 60)
print(f"Директория: {BASE_DIR}")
print(f"Шаблоны: {TEMPLATES_DIR}")

sys.path.append(BASE_DIR)

try:
    from search_algorithm import process_key, find_path_to_one_even, find_path_to_one_random
    print("Модуль search_algorithm успешно импортирован")
except ImportError as e:
    print(f"Ошибка импорта search_algorithm: {e}")
    def process_key(priv_key_hex):
        return {"error": "Модуль search_algorithm не найден"}

app = Flask(__name__, 
            template_folder=TEMPLATES_DIR,
            static_folder=os.path.join(BASE_DIR, 'static'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_key', methods=['POST'])
def process_key_route():
    data = request.json
    priv_key = data.get('key', '')
    algorithm = data.get('algorithm', 'both')
    
    if not priv_key:
        return jsonify({'error': 'Ключ не предоставлен'})
    
    try:
        if algorithm == 'even':
            even_path = find_path_to_one_even(priv_key)
            if len(even_path) > 255:
                even_path = even_path[:256]
            random_path = []
        elif algorithm == 'random':
            random_path = find_path_to_one_random(priv_key)
            if len(random_path) > 255:
                random_path = random_path[:256]
            even_path = []
        else:
            even_path = find_path_to_one_even(priv_key)
            random_path = find_path_to_one_random(priv_key)
            if len(even_path) > 255:
                even_path = even_path[:256]
            if len(random_path) > 255:
                random_path = random_path[:256]
        
        return jsonify({
            "input_key": priv_key,
            "even_path": even_path,
            "random_path": random_path,
            "success": True
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка вычислений: {str(e)}'})

@app.route('/health')
def health():
    
    return jsonify({
        'status': 'ok',
        'port': 5050,
        'timestamp': time.time()
    })

if __name__ == '__main__':
    print(f"\nСервер запущен на порту 5050")
    print("Откройте http://localhost:5050 в браузере")
    print("Для остановки сервера нажмите Ctrl+C")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5050)