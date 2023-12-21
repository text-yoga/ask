cargo build --target wasm32-unknown-unknown --release
wasm-bindgen ./target/wasm32-unknown-unknown/release/m.wasm --out-dir dist --target web
wasm-bindgen ./target/wasm32-unknown-unknown/release/m2.wasm --out-dir dist --target web
