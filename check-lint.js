const { ESLint } = require('eslint');

async function checkLint() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx']);
  
  let errorCount = 0;
  let warningCount = 0;
  
  results.forEach(result => {
    result.messages.forEach(message => {
      if (message.severity === 2) {
        errorCount++;
        console.log(`ERROR: ${result.filePath}:${message.line}:${message.column} - ${message.message}`);
      } else if (message.severity === 1) {
        warningCount++;
        console.log(`WARNING: ${result.filePath}:${message.line}:${message.column} - ${message.message}`);
      }
    });
  });
  
  console.log(`\nSummary: ${errorCount} errors, ${warningCount} warnings`);
  return errorCount === 0;
}

checkLint().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
