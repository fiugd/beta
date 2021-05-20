⍝ https://github.com/PlanetAPL/node-apl
⍝ k language which is like apl - https://github.com/JohnEarnest/ok

⍝ https://codemirror.net/mode/apl/index.html

⍝ This program is very simple in APL!

'Hello World!'

⍝ In APL, anything that is printed in quotes is printed to the terminal. (⍝ in APL signifies a comment)

⍝ If the "Hello World statement needed to be stored, then you could use the following :
h ← 'Hello World'
h

⍝Typing h causes h's value to be printed to be printed.


⍝ fibo from replit examples 7

fib←{
	⍵∊0 1:⍵
	+/∇¨⍵-1 2
}
fib ¨ ⍳ 10


⍝ all APL chars in unicode
⍝ ¯ × ÷ ∘ ∣ ∼ ≠ ≤ ≥ ≬ ⌶ ⋆ ⌾ ⍟ ⌽ ⍉ ⍝ ⍦ ⍧ ⍪ ⍫ ⍬ ⍭ ← ↑ → ↓ ∆ ∇ ∧ ∨ ∩ ∪ ⌈ ⌊ ⊤ ⊥ ⊂ ⊃ ⌿ ⍀ ⍅ ⍆ ⍏ ⍖ ⍊ ⍑ ⍋ ⍒ ⍎ ⍕ ⍱ ⍲ ○ ⍳ ⍴ ⍵ ⍺ ⍶ ⍷ ⍸ ⍹ ⍘ ⍙ ⍚ ⍛ ⍜ ⍮ ¨ ⍡ ⍢ ⍣ ⍤ ⍥ ⍨ ⍩
