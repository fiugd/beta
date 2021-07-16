`` naive implementation
fib := n => n :: {
	0 -> 0
	1 -> 1
	_ -> fib(n - 1) + fib(n - 2)
}

`` memoized / dynamic programming implementation
memo := [0, 1]
fibMemo := n => (
	memo.(n) :: {
		() -> memo.(n) := fibMemo(n - 1) + fibMemo(n - 2)
	}
	memo.(n)
)

fibRange := (n, fun) => reduce(
	range(0, n + 1, 1)
	(a, o) => a + fun(o) + ' '
	' '
)

log(fibRange(9, fibMemo))