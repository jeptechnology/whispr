// Tests
const path = require("path");
const { PostProcessSupportPackage, spdb } = require("./support_package");

function runTests()
{
  PostProcessSupportPackage(path.join(__dirname, "test", "rtos.tgz"), path.join(__dirname, "output", "rtos"));
  PostProcessSupportPackage(path.join(__dirname, "test", "wiser-home.tgz"), path.join(__dirname, "output", "wiser-home"));
  PostProcessSupportPackage(path.join(__dirname, "test", "multi-container.tgz"), path.join(__dirname, "output", "multi-container")); 
}

// export the test function so it can be used in other modules
module.exports = {
  runTests
}
