function IntcodeComputer(program) {
  this.originalProgram = program;
  this.program = this.originalProgram.slice();
  this.pointer = 0;
  this.opcodeVals = {
    ADD: 1,
    MULTIPLY: 2,
    INPUT: 3,
    OUTPUT: 4,
    JUMP_TRUE: 5,
    JUMP_FALSE: 6,
    LESS_THAN: 7,
    EQUALS: 8,
    END: 99,
  };
  this.paramModeVals = {
    POSITION: 0,
    IMMEDIATE: 1,
  };
}

IntcodeComputer.prototype.runDiagnostic = function(input) {
  while (this.pointer < this.program.length) {
    const instruction = this.program[this.pointer];
    const codes = String(instruction);
    const opcode = Number(codes.slice(-2));
    const paramModes = codes.slice(0, -2);

    const { params, shouldJump, numAdvance } = this.getParams(opcode, paramModes);
    switch (opcode) {
      case this.opcodeVals.ADD:
        this.add(...params);
        break;
      case this.opcodeVals.MULTIPLY:
        this.multiply(...params);
        break;
      case this.opcodeVals.INPUT:
        this.input(input);
        break;
      case this.opcodeVals.OUTPUT:
        const output = this.output(params[0]);
        if (output !== undefined) {
          this.resetComputer();
          return output;
        };
        break;
      case this.opcodeVals.JUMP_TRUE:
      case this.opcodeVals.JUMP_FALSE:
        if (shouldJump) {
          this.jump(params[1]);
        }
        break;
      case this.opcodeVals.LESS_THAN:
        this.lessThan(...params);
        break;
      case this.opcodeVals.EQUALS:
        this.equals(...params);
        break;
      default:
        throw new Error(`Something went wrong at opcode ${opcode}, index ${i}`);
    }

    this.pointer += numAdvance;
  }

  throw new Error('Did not receive end code');
}

IntcodeComputer.prototype.getParams = function(opcode, paramModes) {
  const arithmetic = [this.opcodeVals.ADD, this.opcodeVals.MULTIPLY];
  const io = [this.opcodeVals.INPUT, this.opcodeVals.OUTPUT];
  const jump = [this.opcodeVals.JUMP_TRUE, this.opcodeVals.JUMP_FALSE];
  const compare = [this.opcodeVals.LESS_THAN, this.opcodeVals.EQUALS];

  const params = [];
  let shouldJump = false;
  let numAdvance;
  if (arithmetic.includes(opcode) || compare.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(
        Number(paramModes[paramModes.length - i]) === this.paramModeVals.IMMEDIATE
          ? this.program[this.pointer + i]
          : this.program[this.program[this.pointer + i]]
      );
    }
    params.push(this.program[this.pointer + 3]);
    numAdvance = 4;
  } else if (io.includes(opcode)) {
    params.push(
      Number(paramModes) === this.paramModeVals.IMMEDIATE
        ? this.program[this.pointer + 1]
        : this.program[this.program[this.pointer + 1]]
    );
    numAdvance = 2;
  } else if (jump.includes(opcode)) {
    for (let i = 1; i < 3; i++) {
      params.push(
        Number(paramModes[paramModes.length - i]) === this.paramModeVals.IMMEDIATE
          ? this.program[this.pointer + i]
          : this.program[this.program[this.pointer + i]]
      );
    }
    shouldJump = opcode === this.opcodeVals.JUMP_TRUE
      ? params[0] !== 0
      : params[0] === 0;
    numAdvance = shouldJump ? 0 : 3;
  }

  return { params, numAdvance, shouldJump };
};

IntcodeComputer.prototype.add = function(opA, opB, target) {
  this.program[target] = opA + opB;
};

IntcodeComputer.prototype.multiply = function(opA, opB, target) {
  this.program[target] = opA * opB;
};

IntcodeComputer.prototype.input = function(input) {
  const target = this.program[this.pointer + 1];
  this.program[target] = input;
};

IntcodeComputer.prototype.output = function(output) {
  if (this.program[this.pointer + 2] === this.opcodeVals.END) {
    return output
  };
  if (output !== 0) {
    throw new Error(`Received non-zero output of ${output}`);
  }
};

IntcodeComputer.prototype.jump = function(pointer) {
  this.pointer = pointer;
};

IntcodeComputer.prototype.lessThan = function(opA, opB, target) {
  this.program[target] = opA < opB ? 1 : 0;
};

IntcodeComputer.prototype.equals = function(opA, opB, target) {
  this.program[target] = opA === opB ? 1 : 0;
};

IntcodeComputer.prototype.resetComputer = function() {
  this.program = this.originalProgram.slice();
  this.pointer = 0;
}

module.exports = IntcodeComputer;
