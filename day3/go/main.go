package main

import (
	"fmt"
	"io/ioutil"
	"math"
	"strconv"
	"strings"
)

type points map[[2]float64]float64
type directions map[byte]float64

func main() {
	input, err := ioutil.ReadFile("../input.txt")
	if err != nil {
		panic(err)
	}

	paths := strings.Split(string(input), "\n")
	wirePaths := make(chan points, 2)
	for _, p := range paths {
		go getPoints(p, wirePaths)
	}

	pA, pB := <-wirePaths, <-wirePaths

	// Part 1
	closest, err := closestIntersection(pA, pB)
	if err != nil {
		panic(err)
	}
	fmt.Println(closest)

	// Part 2
	fewest, err := fewestCombinedSteps(pA, pB)
	if err != nil {
		panic(err)
	}
	fmt.Println(fewest)
}

func getPoints(wirePath string, c chan points) {
	dX := directions{'L': -1, 'R': 1, 'U': 0, 'D': 0}
	dY := directions{'L': 0, 'R': 0, 'U': 1, 'D': -1}
	pointMap := make(points)
	var x, y, length float64

	cmdList := strings.Split(wirePath, ",")
	for _, cmd := range cmdList {
		dir := cmd[0]
		n, err := strconv.Atoi(cmd[1:])
		if err != nil {
			panic(err)
		}

		for i := 1; i <= n; i++ {
			x += dX[dir]
			y += dY[dir]
			length++
			key := [2]float64{x, y}
			if _, ok := pointMap[key]; !ok {
				pointMap[key] = length
			}
		}
	}

	c <- pointMap
}

func intersection(pA, pB points) [][2]float64 {
	var ps [][2]float64
	for key := range pA {
		if _, ok := pB[key]; ok {
			ps = append(ps, key)
		}
	}
	return ps
}

func closestIntersection(pA, pB points) (float64, error) {
	intersections := intersection(pA, pB)
	closest := math.Inf(1)
	for _, xy := range intersections {
		total := math.Abs(xy[0]) + math.Abs(xy[1])
		if total < closest {
			closest = total
		}
	}
	return closest, nil
}

func fewestCombinedSteps(pA, pB points) (float64, error) {
	intersections := intersection(pA, pB)
	fewest := math.Inf(1)
	for _, xy := range intersections {
		total := pA[xy] + pB[xy]
		if total < fewest {
			fewest = total
		}
	}
	return fewest, nil
}
