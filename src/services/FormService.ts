const FormService = {
  getValueByID: (id: string) => {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
      return element.value;
    }
    return '';
  },
  getValueByName: (name: string): string => {
    const elements = document.getElementsByName(name);
    if (elements.length) {
      const inputElements = Array.from(elements).filter((element) => (element instanceof HTMLInputElement));
      if (inputElements.length > 1) {
        return inputElements.map((element) => {
          if (element instanceof HTMLInputElement) {
            return element.value;
          }
        }).join(',');
      } else {
        if (inputElements[0] instanceof HTMLInputElement) {
          return inputElements[0].value;
        }
      }
    }
    return '';
  }
}
export default FormService;