(* import ../../shared.styl *)

(*
example comment
*)

let log: int -> unit = [%raw {|
	function(a){
		return update(a + " ");
	}
|}]

let rec fib n =
	match n with
	| 0|1 -> n
	| n -> (fib (n - 1)) + (fib (n - 2))
let _ = for x=0 to 9
	do log( fib x )
	done
