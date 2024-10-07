const setButton = document.getElementById('btn')

setButton.addEventListener('click', () => {
  window.electronAPI.chooseSupportPackage()
})