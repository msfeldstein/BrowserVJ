class Palette extends VJSSignal
  name: "Palette"
  inputs: [
    {name: "A", type: "color", default: "#D6835B"}
    {name: "B", type: "color", default: "#AC627D"}
    {name: "C", type: "color", default: "#2D384C"}
  ]
  outputs: [
    {name: "A", type: "color", hidden: true}
    {name: "B", type: "color", hidden: true}
    {name: "C", type: "color", hidden: true} 
  ]
  
  initialize: () ->
    super()