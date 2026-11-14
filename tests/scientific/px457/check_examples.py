"""Compile/exercise exact fenced teaching examples; no GPU claims without CUDA."""
from pathlib import Path
import re, subprocess, os, json, shutil

root = Path.cwd()
out = root / "artifacts/px457/native"
out.mkdir(parents=True, exist_ok=True)

def blocks(slug):
    return re.findall(r"```c\n(.*?)\n```", (root / f"_notes/px457/{slug}.md").read_text(), re.S)

def choose(slug, marker):
    return next(s for s in blocks(slug) if marker in s)

results = []
def run(name, code, compiler, args=None, flags=None, env=None):
    source = out / f"{name}.c"
    binary = out / name
    source.write_text(code)
    cmd = [compiler, "-std=c11", "-O2", "-Wall", "-Wextra", *(flags or []), str(source), "-o", str(binary)]
    subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=30)
    output = subprocess.run([str(binary), *(args or [])], check=True, capture_output=True, text=True, timeout=30, env=env).stdout
    results.append({"name": name, "compiler": cmd, "stdout": output})
    return binary, output

gcc = os.environ.get("PX457_CC") or shutil.which("gcc-15")
if not gcc: raise RuntimeError("Set PX457_CC to a C compiler with OpenMP support")
env = dict(os.environ, OMP_NUM_THREADS="4")
run("omp-hello", choose("openmp-parallels-work-sharing", "#include <stdio.h>"), gcc, flags=["-fopenmp"], env=env)

preamble = "#include <stdio.h>\n#include <stdlib.h>\n#include <math.h>\n#include <omp.h>\n"
scope = choose("openmp-variables-synchronisation", "double t[8]")
run("omp-first-lastprivate", preamble+"int main(void){int rmax=7;\n"+scope+"\nif(result != pow(6,7)) return 1; return 0;}\n", gcc, flags=["-fopenmp", "-lm"], env=env)
found = choose("openmp-dependencies", "int found = 0;")
run("omp-flag", preamble+"int main(void){int n=7; double a[]={0,1,2,3,4,5,6}, threshold=5;\n"+found+"\nif(found!=1)return 1;return 0;}\n", gcc, flags=["-fopenmp"], env=env)
reduction = choose("openmp-variables-synchronisation", "double sum = 0.0;")
run("omp-sum", preamble+"int main(void){int n=7;double a[]={1,2,3,4,5,6,7};\n"+reduction+"\nif(sum!=28)return 1;return 0;}\n", gcc, flags=["-fopenmp"], env=env)

original = choose("openmp-dependencies", "b[i] += a[i-1];")
shifted = choose("openmp-dependencies", "b[1] += a[0];")
transform = preamble + '''
int main(void){
 for(int n=2;n<35;++n){
 double a[35],b[35],c[35],want_a[35],want_b[35];
 for(int i=0;i<n;++i){a[i]=i+1;b[i]=2*i;c[i]=3*i;}
''' + original + '''
 for(int i=0;i<n;++i){want_a[i]=a[i];want_b[i]=b[i];a[i]=i+1;b[i]=2*i;}
''' + shifted + '''
 for(int i=0;i<n;++i) if(a[i]!=want_a[i] || b[i]!=want_b[i]) return 1;
 }return 0;}
'''
run("omp-shift-equivalence",transform,gcc,flags=["-fopenmp"],env=env)

accumulators = choose("intro-optimisation", "double t0 = 0")
run("sum-remainder", preamble+"int main(void){for(int N=0;N<35;++N){double A[35];for(int j=0;j<N;++j)A[j]=j+1;\n"+accumulators+"\nif(sum!=N*(N+1)/2.0)return 1;}return 0;}\n",gcc)

for slug, name in [("mpi-intro","mpi-hello"),("mpi-point-to-point","mpi-squares")]:
    code=choose(slug,"#include <stdio.h>")
    binary,_=run(name,code,"mpicc")
    for ranks in [1,2,4]:
        output=subprocess.run(["mpiexec","-np",str(ranks),str(binary)],check=True,capture_output=True,text=True,timeout=30).stdout
        if name=="mpi-hello":
            assert sorted(output.strip().splitlines())==sorted(f"Hello PX457 from rank {r} of {ranks}" for r in range(ranks))
        else:
            assert output.strip().splitlines()==[f"Rank {r} sent {r*r}" for r in range(1,ranks)]
        results.append({"name":name,"ranks":ranks,"stdout":output})
(out / "report.json").write_text(json.dumps(results,indent=2)+"\n")
print("Passed native source examples: hello, scope/copyback, flag/sum reductions, shift equivalence, accumulator remainders; MPI hello/squares at 1,2,4 ranks.")
