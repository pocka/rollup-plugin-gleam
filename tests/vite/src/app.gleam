import hello

@external(javascript, "./app.ffi.ts", "render")
fn render(text: String) -> Nil

pub fn main() -> Nil {
  render(hello.hello("World"))
}
