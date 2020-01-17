package main

import (
	"fmt"
	"io/ioutil"
	"math"
	"strconv"
	"strings"
)

type Opcode int
type ParamMode int

const (
	Add Opcode = iota + 1
	Multiply
	Input
	Output
	JumpTrue
	JumpFalse
	LessThan
	Equals
	End Opcode = 99
)

const (
	Position ParamMode = iota
	Immediate
)

const Halt string = "Halt"

type IntComp struct {
	program []int
	pointer int
}

func main() {
	input, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}
	var inputData []int
	for _, s := range strings.Split(string(input), ",") {
		v, _ := strconv.Atoi(s)
		inputData = append(inputData, v)
	}

	inputDataCopy := make([]int, len(inputData))
	copy(inputDataCopy, inputData)

	max, err := findMaxOutput(inputDataCopy, 0, 4)
	if err != nil {
		panic(err)
	}

	maxFeedback, err := findMaxOutputFeedbackLoop(inputData, 5, 9)
	if err != nil {
		panic(err)
	}

	// Part 1
	fmt.Println(max)
	// Part 2
	fmt.Println(maxFeedback)
}

type Params struct {
	params     []int
	shouldJump bool
	numAdvance int
}

func (ic *IntComp) runDiagnostic(i chan int) (int, string) {
	for {
		instr := ic.program[ic.pointer]
		codes := strconv.Itoa(instr)
		opcode, _ := strconv.Atoi(codes[int(math.Max(float64(len(codes)-2), 0)):])
		o := Opcode(opcode)
		pm := codes[0:int(math.Max(float64(len(codes)-2), 0))]

		p := ic.getParams(o, pm)
		switch o {
		case Add:
			ic.add(p.params)
		case Multiply:
			ic.mult(p.params)
		case Input:
			ic.input(<-i)
		case Output:
			ic.pointer += p.numAdvance
			return p.params[0], ""
		case JumpTrue, JumpFalse:
			if p.shouldJump {
				ic.jump(p.params[1])
			}
		case LessThan:
			ic.lessThan(p.params)
		case Equals:
			ic.equals(p.params)
		case End:
			return 0, Halt
		default:
			panic(fmt.Errorf("Something went wrong at opcode %d", o))
		}

		ic.pointer += p.numAdvance
	}
}

func (ic *IntComp) getParams(o Opcode, pms string) Params {
	arithmetic := [2]Opcode{Add, Multiply}
	io := [2]Opcode{Input, Output}
	jump := [2]Opcode{JumpTrue, JumpFalse}
	compare := [2]Opcode{LessThan, Equals}

	p := Params{}
	if contains(arithmetic, o) || contains(compare, o) {
		for i := 1; i < 3; i++ {
			var n int
			pm := safelyGetParamModes(pms, i)
			if ParamMode(pm) == Immediate {
				n = ic.program[ic.pointer+i]
			} else {
				n = ic.program[ic.program[ic.pointer+i]]
			}
			p.params = append(p.params, n)
		}
		p.params = append(p.params, ic.program[ic.pointer+3])
		p.numAdvance = 4
	} else if contains(io, o) {
		var n int
		pm, _ := strconv.Atoi(pms)
		if ParamMode(pm) == Immediate {
			n = ic.program[ic.pointer+1]
		} else {
			n = ic.program[ic.program[ic.pointer+1]]
		}
		p.params = append(p.params, n)
		p.numAdvance = 2
	} else if contains(jump, o) {
		for i := 1; i < 3; i++ {
			var n int
			pm := safelyGetParamModes(pms, i)
			if ParamMode(pm) == Immediate {
				n = ic.program[ic.pointer+i]
			} else {
				n = ic.program[ic.program[ic.pointer+i]]
			}
			p.params = append(p.params, n)
		}
		if o == JumpTrue {
			p.shouldJump = p.params[0] != 0
		} else {
			p.shouldJump = p.params[0] == 0
		}
		if !p.shouldJump {
			p.numAdvance = 3
		}
	}

	return p
}

func (ic *IntComp) add(p []int) {
	ic.program[p[2]] = p[0] + p[1]
}

func (ic *IntComp) mult(p []int) {
	ic.program[p[2]] = p[0] * p[1]
}

func (ic *IntComp) input(n int) {
	target := ic.program[ic.pointer+1]
	ic.program[target] = n
}

func (ic *IntComp) jump(n int) {
	ic.pointer = n
}

func (ic *IntComp) lessThan(p []int) {
	var newVal int
	if p[0] < p[1] {
		newVal = 1
	} else {
		newVal = 0
	}
	ic.program[p[2]] = newVal
}

func (ic *IntComp) equals(p []int) {
	var newVal int
	if p[0] == p[1] {
		newVal = 1
	} else {
		newVal = 0
	}
	ic.program[p[2]] = newVal
}

func getPhaseSettings(p ...int) [][]int {
	if len(p) == 1 {
		return [][]int{p}
	}

	var perms [][]int
	smallerPerms := getPhaseSettings(p[1:]...)
	first := p[0]
	for permIdx := 0; permIdx < len(smallerPerms); permIdx++ {
		smallerPerm := smallerPerms[permIdx]

		for posIdx := 0; posIdx <= len(smallerPerm); posIdx++ {
			prefix := append([]int{}, smallerPerm[0:posIdx]...)
			suffix := append([]int{}, smallerPerm[posIdx:]...)
			perms = append(perms, append(prefix, append([]int{first}, suffix...)...))
		}
	}

	return perms
}

func findMaxOutput(p []int, start, stop int) (int, error) {
	var max float64
	settings := getPhaseSettings(makeRange(start, stop)...)

	for _, s := range settings {
		numAmps := stop - start + 1
		amps := make([]IntComp, numAmps)
		for i := range amps {
			pCopy := make([]int, len(p))
			copy(pCopy, p)
			amps[i] = IntComp{
				program: pCopy,
				pointer: 0,
			}
		}

		inputs := make([]chan int, numAmps)
		for i := range inputs {
			inputs[i] = make(chan int, 100)
			inputs[i] <- s[i]
			if i == 0 {
				inputs[i] <- 0
			}
		}

		var output int
		for i, a := range amps {
			nextInput, _ := a.runDiagnostic(inputs[i])
			if i == numAmps-1 {
				output = nextInput
			} else {
				inputs[i+1] <- nextInput
			}
		}

		max = math.Max(float64(output), max)
	}

	return int(max), nil
}

func findMaxOutputFeedbackLoop(p []int, start, stop int) (int, error) {
	var max float64
	numAmps := stop - start + 1
	settings := getPhaseSettings(makeRange(start, stop)...)

	for _, s := range settings {
		amps := make([]IntComp, numAmps)
		for i := range amps {
			pCopy := make([]int, len(p))
			copy(pCopy, p)
			amps[i] = IntComp{
				program: pCopy,
				pointer: 0,
			}
		}

		inputs := make([]chan int, numAmps)
		for i := range inputs {
			inputs[i] = make(chan int, 100)
			inputs[i] <- s[i]
			if i == 0 {
				inputs[i] <- 0
			}
		}

		var output int
		halt := false
		i := 0
		for !halt {
			n := make(chan int)
			h := make(chan bool)
			nextAmp := (i + 1) % numAmps

			go func(idx int) {
				nextInput, end := amps[idx].runDiagnostic(inputs[idx])
				if end == Halt {
					h <- true
				} else {
					n <- nextInput
				}
			}(i)

			select {
			case next := <-n:
				if i == numAmps-1 {
					output = next
				}
				inputs[nextAmp] <- next
			case end := <-h:
				halt = end
			}
			i = nextAmp
		}

		max = math.Max(float64(output), max)
	}

	return int(max), nil
}

func contains(cs [2]Opcode, c Opcode) bool {
	for _, code := range cs {
		if code == c {
			return true
		}
	}
	return false
}

func safelyGetParamModes(pms string, j int) int {
	var pm int
	if len(pms) >= j {
		pm, _ = strconv.Atoi(string(pms[len(pms)-j]))
	} else {
		pm = 0
	}
	return pm
}

func makeRange(min, max int) []int {
	r := make([]int, max-min+1)
	for i := range r {
		r[i] = min + i
	}
	return r
}
