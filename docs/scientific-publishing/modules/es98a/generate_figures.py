"""Rebuild deterministic inline SVG figures; no runtime numerical work or registry changes."""
from pathlib import Path
from math import exp, sqrt, pi
import html
ROOT = Path(__file__).resolve().parents[4]
def plot(title, curves, xr, yr, xlabel, ylabel):
    x0,x1=xr; y0,y1=yr
    def xy(x,y): return (45+260*(x-x0)/(x1-x0),195-140*(y-y0)/(y1-y0))
    out=[f'<svg className="sci-story-svg" viewBox="0 0 340 290" role="img" aria-label="{html.escape(title)}"><title>{html.escape(title)}</title>', '<path d="M45 50V195H310" fill="none" stroke="currentColor" opacity="0.5" />', f'<text x="45" y="25">{html.escape(title)}</text>',f'<text x="300" y="230" textAnchor="end">{html.escape(xlabel)}</text>',f'<text x="45" y="45">{html.escape(ylabel)}</text>']
    for x in [x0,x1]:
        xx,_=xy(x,0);out.append(f'<text x="{xx:.2f}" y="210" textAnchor="middle">{x:g}</text>')
    for y in [y0,y1]:
        _,yy=xy(0,y);out.append(f'<text x="38" y="{yy+4:.2f}" textAnchor="end">{y:g}</text>')
    for i,(name,fn) in enumerate(curves):
        vals=[(x0+(x1-x0)*j/160) for j in range(161)]
        coords=[xy(x,fn(x)) for x in vals]
        assert all(49<=y<=196 for x,y in coords),title
        path=' '.join(('M' if j==0 else 'L')+f'{x:.2f},{y:.2f}' for j,(x,y) in enumerate(coords))
        color='var(--sci-accent)' if i==0 else 'var(--sci-secondary)'
        dash='' if i==0 else ' strokeDasharray="5 4"'
        out.append(f'<path d="{path}" stroke="{color}" strokeWidth="2.5" fill="none"{dash} />')
        out.append(f'<text x="45" y="{252+18*i}">{html.escape(name)}</text>')
    return ''.join(out)+'</svg>'
def figure(n, marker, fid, intro, panels, caption, interpretation):
    file=ROOT/f'_notes/es98a/week{n}.md';s=file.read_text()
    start=f'<!-- {fid}:start -->';end=f'<!-- {fid}:end -->'
    # MDX uses JSX comments, not HTML comments.
    start='<span data-es98a-source="'+fid+':start" />';end='<span data-es98a-source="'+fid+':end" />'
    block=start+'\n\n'+intro+f'\n\n<Figure id="{fid}" caption="{caption}">\n<div className="sci-story-grid sci-story-two">\n'+''.join('<div>'+p+'</div>\n' for p in panels)+'</div>\n</Figure>\n\n'+interpretation+'\n\n'+end
    if start in s:
        a=s.index(start);b=s.index(end,a)+len(end);s=s[:a]+block+s[b:]
    else:
        assert marker in s,marker
        s=s.replace(marker,block+'\n\n'+marker,1)
    file.write_text(s)
figure(3,'### Why the update is a projection','es98a-gaussian-slice','What changes when the two sensors are correlated? Compare the same observation $x_2=1$ under two joint Gaussian models.',[
plot('Uncorrelated sensors',[('conditional = marginal',lambda x:exp(-x*x/2)/sqrt(2*pi))],(-3,3),(0,0.7),'x₁','density'),
plot('Correlation 0.8',[('solid: conditional on x₂ = 1',lambda x:exp(-(x-.8)**2/(2*.36))/sqrt(2*pi*.36)),('dashed: marginal',lambda x:exp(-x*x/2)/sqrt(2*pi))],(-3,3),(0,.7),'x₁','density')],
'Unit marginal variances and zero prior means. With correlation 0.8, the conditional mean is 0.8 and variance is 0.36. Axes match across panels.',
'The correlated reading moves the centre and narrows the distribution. The next derivation explains both changes using an independent Gaussian residual.')
figure(4,'### Markov chain Monte Carlo','es98a-sampling-cost','Before replacing independent samples by a chain, compare the cost of precision with the cost of correlation.',[
plot('Independent sampling',[('solid: RMSE = 1 / √J',lambda x:1/sqrt(x))],(1,100),(0,1),'draws J','RMSE (unit variance)'),
plot('Stationary correlation',[('solid: lag correlation 0.9ᵏ',lambda x:.9**x),('dashed: lag correlation 0.2ᵏ',lambda x:.2**x)],(0,30),(0,1),'lag k','correlation')],
'Left: exact iid RMSE for an observable of variance one. Right: illustrative stationary correlation sequences; these are analytic models, not simulated chains.',
'Four times as many iid draws halve RMSE. A slowly decaying lag correlation can undo much of that gain: many recorded states need not mean many independent pieces of information.')
figure(5,'### Sobolev spaces','es98a-fourier-tail','An infinite expansion needs more than small individual coefficients. Compare the coefficient size with the squared tail remaining after truncation.',[
plot('Coefficients uₙ = 1/n',[('solid: |uₙ|',lambda x:1/x)],(1,20),(0,1),'mode n','coefficient'),
plot('Squared tail bounds',[('solid: upper bound 1/N',lambda x:1/x),('dashed: lower bound 1/(N+1)',lambda x:1/(x+1))],(1,20),(0,1),'cutoff N','squared norm error')],
'For an ONB and coefficients 1/n, Parseval gives squared truncation error Σ above N of 1/n². Integral comparison bounds it between 1/(N+1) and 1/N.',
'The coefficients go to zero like 1/n, while norm error is of order 1/√N. Differentiation multiplies Fourier coefficients by n; square summability can then disappear. This motivates a norm that measures smoothness.')
figure(6,'A Hilbert space $\\mathcal{H}$','es98a-point-evaluation','Keep the centre value fixed while narrowing a spike. Can its area-based norm detect what a point sensor sees?',[
plot('Triangular spikes',[('solid: width 1',lambda x:max(1-abs(x),0)),('dashed: width 0.2',lambda x:max(1-5*abs(x),0))],(-1,1),(0,1),'location t','height'),
plot('Norm tends to zero',[('solid: squared L² norm = 2h/3',lambda x:2*x/3)],(0,1),(0,1),'half-width h','squared norm')],
'Spike fₕ(t) = max(1 − |t|/h, 0), h positive. Every spike has fₕ(0)=1, but squared L² norm 2h/3 tends to zero.',
'An L²-small perturbation need not be small at the sensor. An RKHS repairs this by making evaluation a bounded linear functional in its own norm.')
figure(7,'### Gaussian white noise','es98a-variance-budget','Random coefficients must share a finite variance budget. Compare decaying mode variances with constant mode variance.',[
plot('Decaying variance',[('solid: sum through N of 1/n²',lambda x:sum(1/n**2 for n in range(1,int(x)+1)))],(1,20),(0,2),'modes N','total variance'),
plot('White-noise truncation',[('solid: sum through N of 1',lambda x:int(x))],(1,20),(0,20),'modes N','total variance')],
'Each panel shows cumulative expected squared norm for an orthonormal expansion. Vertical scales differ: the left stays below π²/6; the right grows as N.',
'Every finite white-noise truncation exists, yet their expected squared norms have no finite limit. For Gaussian white noise the strong law gives the stronger almost-sure divergence stated below.')
figure(8,'### Convergence without a rate','es98a-filter-balance','What exactly does regularisation refuse to invert? Compare the filters and the two competing error bounds.',[
plot('Filter, α = 0.04',[('solid: t/(t² + α)',lambda t:t/(t*t+.04)),('dashed: inverse 1/t',lambda t:1/t)],(.1,1),(0,10),'singular value t','data amplification'),
plot('Error bound, δ = 0.02',[('solid: bias bound α (s = 1)',lambda a:a),('dashed: noise δ/(2√α)',lambda a:.02/(2*sqrt(a)))],(.001,.2),(0,.35),'parameter α','norm bound')],
'Left: Tikhonov caps amplification at 2.5 for α=0.04. Right: source radius M₁=1 and noise bound δ=0.02; curves are norm-error bounds, not realised errors.',
'The smallest singular values are suppressed rather than accurately inverted. Increasing α lowers noise amplification but raises bias; the derivation below quantifies a schedule that sends both to zero.')
# right bias should sqrt(alpha) for s=1: use s=2 instead
file=ROOT/'_notes/es98a/week8.md';s=file.read_text().replace('bias bound α (s = 1)','bias bound α (s = 2)').replace('source radius M₁=1','source radius M₂=1');file.write_text(s)
figure(9,'To what extent is this heuristic','es98a-threshold','The scalar formulas let us see the difference between shrinking a coefficient and removing it.',[
plot('L1: a zero interval',[('solid: soft threshold, α = 1',lambda y:(1 if y>0 else -1)*max(abs(y)-1,0))],(-3,3),(-3,3),'observation y','estimate u'),
plot('Ridge: uniform shrinkage',[('solid: y / 2, α = 1',lambda y:y/2)],(-3,3),(-3,3),'observation y','estimate u')],
'Exact scalar minimisers for A=I and α=1. The same axis scales show that l1 creates exact zeros on the interval [−1,1], while ridge shrinks every nonzero coefficient.',
'The flat segment is the algebraic counterpart of the norm-ball corners. For a general forward matrix the coordinates interact, so this panel explains the mechanism without promising universal sparsity.')
# pair prior and posterior mean/std band represented as boundary lines
k=lambda x:exp(-x*x/2)
figure(10,'### Derive the prediction','es98a-gp-prediction','A single observation can affect a whole function. Where should its influence, and the reduction in uncertainty, be strongest?',[
plot('Prior at each location',[('solid: mean 0',lambda x:0),('dashed: +1 standard deviation',lambda x:1)],(-3,3),(-.5,2.5),'location z','latent value'),
plot('After y = 2 at z = 0',[('solid: posterior mean',lambda x:1.6*k(x)),('dashed: mean + std. deviation',lambda x:1.6*k(x)+sqrt(1-k(x)**2/1.25))],(-3,3),(-.5,2.5),'location z','latent value')],
'Zero-mean squared-exponential prior k(z,z′)=exp(−(z−z′)²/2), unit marginal variance, one observation y=2 at zero and noise variance 0.25. Dashed curves show only the upper one-standard-deviation boundary, not sample paths or simultaneous confidence bands.',
'At the sensor the posterior mean is 1.6 and variance 0.2. Far away, covariance with the sensor tends to zero, restoring the prior mean and variance. The observation changes the mean through correlation and leaves residual uncertainty because its noise is nonzero.')
