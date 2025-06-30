// Sample JavaScript file for testing
function greet(name) {
  return `Hello, ${name}!`;
}

const users = ['Alice', 'Bob', 'Charlie'];
users.forEach(user => {
  console.log(greet(user));
});

module.exports = { greet };