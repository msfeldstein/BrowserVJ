### 
Signals are used to generate values for driving inputs on effects and compositions

  inputs:
    name: User readable name
    type: boolean|number|select
    default: Value to initialize to
    options (only for select): Array of option values to show in the popup
    min (only for numbers): number
    max (only for numbers): number

  outputs:
    name: User readable name
    type: boolean|number|select|function
    default: Value to initialize to
    callback (only for function): String with name of member function to call back
      (observer, observingProperty) -> This function is called with the object that
      wants to observe this output.  See Midi.Midi Listen
    min (only for numbers): number
    max (only for numbers): number
  ###
class VJSSignal extends VJSBindable

  inputs: []
  outputs: []

  update: (time) ->
    # Override