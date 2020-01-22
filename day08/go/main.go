package main

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"
)

const (
	black = iota
	white
	transparent
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

	d, err := decodeImage(n, 25, 6)
	if err != nil {
		panic(err)
	}

	// Part 1
	fmt.Println(v)

	// Part 2
	fmt.Println(translateDecoding(d))
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

func decodeImage(t string, w, h int) ([][]int, error) {
	layers := getSlices(t, w*h)
	layersByRows := make([][]string, len(layers))
	for i, l := range layers {
		layersByRows[i] = getSlices(l, w)
	}

	d := make([][]int, h)
	for i := 0; i < w; i++ {
		for j := 0; j < h; j++ {
			if i == 0 {
				d[j] = make([]int, w)
			}
			for k, pixelFound := 0, false; k < len(layersByRows) && !pixelFound; k++ {
				v, err := strconv.Atoi(string(layersByRows[k][j][i]))
				if err != nil {
					return nil, err
				} else if v != transparent {
					d[j][i] = v
					pixelFound = true
				}
			}
		}
	}

	return d, nil
}

func translateDecoding(img [][]int) string {
	var t strings.Builder
	for _, row := range img {
		var r strings.Builder
		for _, pixel := range row {
			var p string
			if pixel == black {
				p = "\u25A0"
			} else {
				p = "\u25A1"
			}
			r.WriteString(p)
		}
		t.WriteString(r.String() + "\n")
	}
	return t.String()
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
