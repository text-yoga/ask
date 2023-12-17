use yew_agent::PublicWorker;
fn main() {
    console_error_panic_hook::set_once();
    text_yoga_ai::Worker::register();
}
