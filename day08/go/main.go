package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
)

func main() {
	input, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}
	n := string(input)

	v, err := checkFidelity(n, 25, 6)
	if err != nil {
		panic(err)
	}

	// Part 1
	fmt.Println(v)
}

type Count struct {
	zeroes int
	ones   int
	twos   int
}

func checkFidelity(t string, w, h int) (int, error) {
	layers := getSlices(t, w*h)

	var count Count
	for i, layer := range layers {
		c := Count{}
		for _, str := range layer {
			n, err := strconv.Atoi(string(str))
			if err != nil {
				return 0, err
			}
			switch n {
			case 0:
				c.zeroes++
			case 1:
				c.ones++
			case 2:
				c.twos++
			}
		}
		if c.zeroes < count.zeroes || i == 0 {
			count = c
		}
	}

	return count.ones * count.twos, nil
}

func getSlices(s string, ls int) []string {
	var layers []string
	i := 0
	for i < len(s) {
		j := i + ls
		layers = append(layers, s[i:j])
		i = j
	}
	return layers
}
