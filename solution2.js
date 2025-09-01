// solution2.js
const fs = require('fs');
let input;
try {
  input = JSON.parse(fs.readFileSync('input.json', 'utf8')); // Reading from input.json for local testing
} catch (e) {
  console.error('Error parsing JSON:', e);
  process.exit(1);
}

const { n, k } = input.keys;
const m = k - 1; // Degree of the polynomial

// Function to convert a number from given base to base 10 (using BigInt)
function convertToBase10(value, base) {
  return BigInt(parseInt(value, base));
}

// Collect roots as (x, y) pairs
const points = [];
for (let i = 1; i <= n; i++) {
  const key = i.toString();
  if (input[key]) {
    const x = BigInt(i);
    const y = convertToBase10(input[key].value, parseInt(input[key].base));
    points.push([x, y]);
  }
}

// Ensure we have at least k points
if (points.length < k) {
  console.error('Not enough points to reconstruct polynomial');
  process.exit(1);
}

// Lagrange interpolation to find polynomial coefficients
function lagrangeInterpolation(points, k) {
  const coeffs = Array(k).fill(BigInt(0));
  
  // For each point (x_i, y_i)
  for (let i = 0; i < k; i++) {
    const [xi, yi] = points[i];
    let term = [BigInt(1)]; // Polynomial term for this point (starts as 1)
    
    // Compute the denominator: product of (x_i - x_j) for j != i
    let denominator = BigInt(1);
    for (let j = 0; j < k; j++) {
      if (i !== j) {
        denominator *= xi - points[j][0];
      }
    }
    
    // Compute the Lagrange basis polynomial l_i(x) = prod((x - x_j)/(x_i - x_j)) for j != i
    for (let j = 0; j < k; j++) {
      if (i !== j) {
        const xj = points[j][0];
        // Multiply term by (x - x_j)
        const newTerm = [];
        for (let t = 0; t < term.length; t++) {
          newTerm[t] = (newTerm[t] || BigInt(0)) - term[t] * xj;
          newTerm[t + 1] = (newTerm[t + 1] || BigInt(0)) + term[t];
        }
        term = newTerm;
      }
    }
    
    // Scale by y_i / denominator
    for (let t = 0; t < term.length; t++) {
      if (term[t]) {
        coeffs[t] = (coeffs[t] || BigInt(0)) + term[t] * yi / denominator;
      }
    }
  }
  
  return coeffs;
}

// Compute coefficients using the first k points
const coeffs = lagrangeInterpolation(points.slice(0, k), k);

// Reverse to get from highest to lowest degree and extract constant
const reversedCoeffs = coeffs.reverse();
const constant = reversedCoeffs[reversedCoeffs.length - 1]; // Last element is the constant term

// Output coefficients and constant
console.log(`Coefficients (highest to lowest degree): ${reversedCoeffs.map(c => c.toString()).join(' ')}`);
console.log(`Constant term: ${constant.toString()}`);