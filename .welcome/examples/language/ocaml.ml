(* import ../../shared.styl *)

(*
example comment
*)

let log: int -> unit = [%raw {| (a) => update(a + " ") |}]

let rec fib n =
	match n with
	| 0|1 -> n
	| n -> fib(n - 1) + fib(n - 2)

let _ = for i = 0 to 9 do
	log( fib i )
done
