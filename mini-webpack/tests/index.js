import { getName } from './utils.js'

class Test {
  constructor(name) {
    this.name = getName(name)
  }

  say() {
    return 'hello' + this.name
  }
}

const test = new Test('word')

document.write(test.say())

export default Test
