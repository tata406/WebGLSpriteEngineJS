cd src
./compile_templates.sh
python compile.py
cd ..
cp src/SpriteEngine-min.js examples/js/
cp run_server.sh examples/
