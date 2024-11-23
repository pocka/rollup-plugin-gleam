import gleam/string
import lustre
import lustre/attribute.{attribute, id}
import lustre/element.{type Element}
import lustre/element/html

// MODEL

pub type Model =
  String

fn init(_) -> Model {
  "World"
}

// UPDATE

pub type Msg {
  Reverse
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    Reverse -> string.reverse(model)
  }
}

// VIEW

fn view(model: Model) -> Element(Msg) {
  html.div([], [
    html.p([id("greeting")], [element.text("Hello, "), element.text(model)]),
    html.button([attribute("aria-controls", "greeting")], [
      element.text("Reverse"),
    ]),
  ])
}

// MAIN

pub fn main() {
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}
