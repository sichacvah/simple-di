import { graph, topoComparator, topoSort } from './dependency'


// building a graph like:
//
//       "a"
//      / |
//    "b" |
//      \ |
//       "c"
//        |
//       "d"
//

const g1 = graph()
  .depend("b", "a")
  .depend("c", "b")
  .depend("c", "a")
  .depend("d", "c")


//      'one'   'five'
//        |       |
//      'two'     |
//       / \      |
//      /   \     |
//     /     \   /
// 'three'  'four'
//    |      /
//  'six'   /
//    |    /
//    |   /
//    |  /
//  'seven'
//

const g2 = graph()
  .depend('two', 'one')
  .depend('three', 'two')
  .depend('four', 'two')
  .depend('four', 'five')
  .depend('six', 'three')
  .depend('seven', 'six')
  .depend('seven', 'four')

//               'level0'
//               / | |  \
//          -----  | |   -----
//         /       | |        \
// 'level1a''level1b''level1c' 'level1d'
//         \       | |        /
//          -----  | |   -----
//               \ | |  /
//               'level2'
//               / | |  \
//          -----  | |   -----
//         /       | |        \
// 'level3a''level3b''level3c''level3d'
//         \       | |        /
//          -----  | |   -----
//               \ | |  /
//               'level4'
//
// ... and so on in a repeating pattern like that, up to 'level26''

const g3 = graph()
  .depend('level1a', 'level0')
  .depend('level1b', 'level0')
  .depend('level1c', 'level0')
  .depend('level1d', 'level0')
  .depend('level2', 'level1a')
  .depend('level2', 'level1b')
  .depend('level2', 'level1c')
  .depend('level2', 'level1d')
  
  .depend('level3a', 'level2')
  .depend('level3b', 'level2')
  .depend('level3c', 'level2')
  .depend('level3d', 'level2')
  .depend('level4', 'level3a')
  .depend('level4', 'level3b')
  .depend('level4', 'level3c')
  .depend('level4', 'level3d')

  .depend('level5a', 'level4')
  .depend('level5b', 'level4')
  .depend('level5c', 'level4')
  .depend('level5d', 'level4')
  .depend('level6', 'level5a')
  .depend('level6', 'level5b')
  .depend('level6', 'level5c')
  .depend('level6', 'level5d')

  .depend('level7a', 'level6')
  .depend('level7b', 'level6')
  .depend('level7c', 'level6')
  .depend('level7d', 'level6')
  .depend('level8', 'level7a')
  .depend('level8', 'level7b')
  .depend('level8', 'level7c')
  .depend('level8', 'level7d')

  .depend('level9a', 'level8')
  .depend('level9b', 'level8')
  .depend('level9c', 'level8')
  .depend('level9d', 'level8')
  .depend('level10', 'level9a')
  .depend('level10', 'level9b')
  .depend('level10', 'level9c')
  .depend('level10', 'level9d')

  .depend('level11a', 'level10')
  .depend('level11b', 'level10')
  .depend('level11c', 'level10')
  .depend('level11d', 'level10')
  .depend('level12', 'level11a')
  .depend('level12', 'level11b')
  .depend('level12', 'level11c')
  .depend('level12', 'level11d')

  .depend('level13a', 'level12')
  .depend('level13b', 'level12')
  .depend('level13c', 'level12')
  .depend('level13d', 'level12')
  .depend('level14', 'level13a')
  .depend('level14', 'level13b')
  .depend('level14', 'level13c')
  .depend('level14', 'level13d')

  .depend('level15a', 'level14')
  .depend('level15b', 'level14')
  .depend('level15c', 'level14')
  .depend('level15d', 'level14')
  .depend('level16', 'level15a')
  .depend('level16', 'level15b')
  .depend('level16', 'level15c')
  .depend('level16', 'level15d')

  .depend('level17a', 'level16')
  .depend('level17b', 'level16')
  .depend('level17c', 'level16')
  .depend('level17d', 'level16')
  .depend('level18', 'level17a')
  .depend('level18', 'level17b')
  .depend('level18', 'level17c')
  .depend('level18', 'level17d')

  .depend('level19a', 'level18')
  .depend('level19b', 'level18')
  .depend('level19c', 'level18')
  .depend('level19d', 'level18')
  .depend('level20', 'level19a')
  .depend('level20', 'level19b')
  .depend('level20', 'level19c')
  .depend('level20', 'level19d')

  .depend('level21a', 'level20')
  .depend('level21b', 'level20')
  .depend('level21c', 'level20')
  .depend('level21d', 'level20')
  .depend('level22', 'level21a')
  .depend('level22', 'level21b')
  .depend('level22', 'level21c')
  .depend('level22', 'level21d')

  .depend('level23a', 'level22')
  .depend('level23b', 'level22')
  .depend('level23c', 'level22')
  .depend('level23d', 'level22')
  .depend('level24', 'level23a')
  .depend('level24', 'level23b')
  .depend('level24', 'level23c')
  .depend('level24', 'level23d')

  .depend('level25a', 'level24')
  .depend('level25b', 'level24')
  .depend('level25c', 'level24')
  .depend('level25d', 'level24')
  .depend('level26', 'level25a')
  .depend('level26', 'level25b')
  .depend('level26', 'level25c')
  .depend('level26', 'level25d')


describe('transitiveDependencies', () => {
  it('should return transitive deps', () => {
    expect(g1.transitiveDependencies('d')).toEqual(new Set(['a', 'b', 'c']))

    expect(g2.transitiveDependencies('seven')).toEqual(new Set(['two', 'four', 'six', 'one', 'five', 'three']))
  })
})

describe('transitiveDependenciesDeep', () => {
  it('should return deep  transitive deps', () => {
    expect(g3.transitiveDependencies('level24')).toEqual(new Set([
      'level0',
      'level1a', 'level1b', 'level1c', 'level1d',
      'level2',
      'level3a', 'level3b', 'level3c', 'level3d',
      'level4',
      'level5a', 'level5b', 'level5c', 'level5d',
      'level6',
      'level7a', 'level7b', 'level7c', 'level7d',
      'level8',
      'level9a', 'level9b', 'level9c', 'level9d',
      'level10',
      'level11a', 'level11b', 'level11c', 'level11d',
      'level12',
      'level13a', 'level13b', 'level13c', 'level13d',
      'level14',
      'level15a', 'level15b', 'level15c', 'level15d',
      'level16',
      'level17a', 'level17b', 'level17c', 'level17d',
      'level18',
      'level19a', 'level19b', 'level19c', 'level19d',
      'level20',
      'level21a', 'level21b', 'level21c', 'level21d',
      'level22',
      'level23a', 'level23b', 'level23c', 'level23d'
    ]))
  })
})

describe('transitiveDepends', () => {
  it('should return transitive depends', () => {
    expect(g2.transitiveDependents('five')).toEqual(new Set([
      'four',
      'seven'
    ]))

    expect(g2.transitiveDependents('two')).toEqual(new Set([
      'four',
      'seven',
      'six',
      'three'
    ]))
  })
})

const isBefore = (coll: string[], x: string, y: string) => {
  for (let item of coll) {
    if (x === item) {
      return true 
    }
    if (y === item) {
      return false
    }
  }
  return true
}

describe('isBefore', () => {
  const coll = ['a', 'b', 'c', 'd']
  it('short before test', () => {
    expect(isBefore(coll, 'a', 'b')).toEqual(true)
    expect(isBefore(coll, 'b', 'c')).toEqual(true)
    expect(isBefore(coll, 'd', 'c')).toEqual(false)
    expect(isBefore(coll, 'c', 'a')).toEqual(false)

  })
})


describe('topoComparator', () => {
  it('g1', () => {
    const sorted = ['d', 'a', 'b', 'foo'].sort(topoComparator(g1))

    expect(isBefore(sorted, 'a', 'b')).toBeTruthy()
    expect(isBefore(sorted, 'a', 'd')).toBeTruthy()
    expect(isBefore(sorted, 'a', 'foo')).toBeTruthy()
    expect(isBefore(sorted, 'b', 'd')).toBeTruthy()
    expect(isBefore(sorted, 'b', 'foo')).toBeTruthy()
    expect(isBefore(sorted, 'd', 'foo')).toBeTruthy()
  })

  it('g2', () => {
    const sorted = ['three', 'seven', 'nine', 'eight', 'five'].sort(topoComparator(g2))

    expect(isBefore(sorted, 'three', 'seven')).toBeTruthy()
    expect(isBefore(sorted, 'three', 'eight')).toBeTruthy()
    expect(isBefore(sorted, 'three', 'nine')).toBeTruthy()
    expect(isBefore(sorted, 'five', 'eight')).toBeTruthy()
    expect(isBefore(sorted, 'five', 'nine')).toBeTruthy()
    expect(isBefore(sorted, 'seven', 'eight')).toBeTruthy()
    expect(isBefore(sorted, 'seven', 'nine')).toBeTruthy()
  })
})

describe('topoSort', () => {
  const sorted = topoSort(g2)

  it('sorted', () => {
    expect(isBefore(sorted, 'one', 'two')).toBeTruthy()
    expect(isBefore(sorted, 'one', 'three')).toBeTruthy()
    expect(isBefore(sorted, 'one', 'four')).toBeTruthy()
    expect(isBefore(sorted, 'one', 'six')).toBeTruthy()
    expect(isBefore(sorted, 'one', 'seven')).toBeTruthy()
    expect(isBefore(sorted, 'two', 'three')).toBeTruthy()
    expect(isBefore(sorted, 'two', 'four')).toBeTruthy()
    expect(isBefore(sorted, 'two', 'six')).toBeTruthy()
    expect(isBefore(sorted, 'two', 'seven')).toBeTruthy()
    expect(isBefore(sorted, 'three', 'six')).toBeTruthy()
    expect(isBefore(sorted, 'five', 'four')).toBeTruthy()
  })
})

describe('no cycles', () => {
  it('circular transitive', () => {
    expect(() => graph().depend('a', 'b').depend('b', 'c').depend('c', 'a')).toThrowError(`Circular dependency between c and a`)
  })

  it('circular immediate', () => {
    expect(() => graph().depend('a', 'b').depend('a', 'a')).toThrowError(`Circular dependency between a and a`)
  })
})

