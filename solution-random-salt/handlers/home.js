function withoutHighlighting() {
  return `
    <h1>Create an account</h1>
    <p>New users <a href="sign-up">sign up for an account</a> or existing users <a href="log-in">log in</a>
  `;
}

function withHighlighting() {
  return /*html*/ `
    <h1>Create an account</h1>
    <p>New users <a href="sign-up">sign up for an account</a> or existing users <a href="log-in">log in</a>
  `;
}
