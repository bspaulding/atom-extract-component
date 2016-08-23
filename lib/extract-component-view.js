'use babel';

export default class ExtractComponentView {

  constructor(serializedState) {
    this.element = document.createElement("div");
    this.element.classList.add("extract-component");

    const message = document.createElement("label");
    message.textContent = "Component Name:";
    message.classList.add("message");
    this.element.appendChild(message);

    const input = document.createElement("atom-text-editor");
    input.setAttribute("mini", true);
    input.setAttribute("tabindex", -1);
    this.element.appendChild(input);
    this.input = input;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  focusInput() {
    this.input.focus();
  }
}
