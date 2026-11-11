#!/usr/bin/env python3
"""Prints the weekly sudoku block (4x4, 6x6, 9x9), each with exactly one solution.
Usage: python3 pipeline/make_sudoku.py 2026-11-16   (the Monday date is the random seed)"""
import json, random, sys
def solve(g,n,br,bc,limit=2):
    cnt=0
    def rec():
        nonlocal cnt
        best=None
        for r in range(n):
            for c in range(n):
                if g[r][c]==0:
                    o=[v for v in range(1,n+1) if all(g[r][k]!=v for k in range(n)) and all(g[k][c]!=v for k in range(n)) and all(g[r//br*br+i][c//bc*bc+j]!=v for i in range(br) for j in range(bc))]
                    if best is None or len(o)<len(best[2]): best=(r,c,o)
        if best is None: cnt+=1; return
        r,c,o=best
        for v in o:
            g[r][c]=v; rec(); g[r][c]=0
            if cnt>=limit: return
    rec(); return cnt
def make(n,br,bc,givens,rnd):
    full=[[0]*n for _ in range(n)]
    def fill(k=0):
        if k==n*n: return True
        r,c=divmod(k,n); vals=list(range(1,n+1)); rnd.shuffle(vals)
        for v in vals:
            if all(full[r][x]!=v for x in range(n)) and all(full[x][c]!=v for x in range(n)) and all(full[r//br*br+i][c//bc*bc+j]!=v for i in range(br) for j in range(bc)):
                full[r][c]=v
                if fill(k+1): return True
                full[r][c]=0
        return False
    fill(); p=[row[:] for row in full]; cells=[(r,c) for r in range(n) for c in range(n)]; rnd.shuffle(cells)
    for r,c in cells:
        if sum(1 for row in p for v in row if v)<=givens: break
        keep=p[r][c]; p[r][c]=0
        if solve([row[:] for row in p],n,br,bc)!=1: p[r][c]=keep
    assert solve([row[:] for row in p],n,br,bc)==1
    return {"n":n,"br":br,"bc":bc,"p":p,"s":full}
if __name__=="__main__":
    rnd=random.Random(sys.argv[1] if len(sys.argv)>1 else "ffmpa")
    print(json.dumps({"x":make(4,2,2,7,rnd),"o":make(6,2,3,15,rnd),"n":make(9,3,3,34,rnd)},separators=(",",":")))
