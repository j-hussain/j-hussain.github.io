---
title: "5. Symmetry and graphs: learning without arbitrary labels"
---

Rename the atoms in a molecule. Nothing physical has changed, yet the coordinate array has been reordered. Rotate the molecule, and its energy still should not change; its force vectors should rotate. A model that depends on arbitrary labels or laboratory orientation spends data learning relationships we already know.

These are architectural questions rather than optimisation questions. A dense layer from a $256\times256$ single-channel image to 1,000 hidden units has 65,536,000 weights before biases. It can learn spatial structure, but supplies neither locality nor translation symmetry by construction. An **inductive bias** restricts or favours functions according to relevant structure.

**In this chapter:** [group actions](#symmetry), [structured architectures](#architectures), [message passing](#message-passing), [permutation proof](#permutation).

<h2 id="symmetry">The output need not transform like the input</h2>

Let a group element $g$ act on inputs by $\rho_X(g)$ and outputs by $\rho_Y(g)$. A map is **equivariant** if

$$
f(\rho_X(g)x)=\rho_Y(g)f(x).
$$

It is **invariant** when the output action is the identity, so $f(\rho_X(g)x)=f(x)$. Distinct input and output actions are essential: positions, vectors, tensors and scalars transform differently. Invariance is not restricted to scalar-valued functions, and equivariance is not restricted to vectors.

For positions $r=(r_1,\ldots,r_N)$, a rigid transformation is $r_i\mapsto Rr_i+a$, with orthogonal $R$. Suppose a differentiable energy satisfies $E(Rr+a)=E(r)$. Applying the chain rule gives

$$
R^T\nabla_{r_i'}E(r')=\nabla_{r_i}E(r),\qquad
F_i(r')=RF_i(r),\quad F_i=-\nabla_{r_i}E.
$$

Forces rotate, but a pure translation leaves their vector components unchanged. They do not acquire the positional offset $a$. This corrects the source's ambiguous statement that forces are “equivariant to translation” under the same action as positions. Translation invariance also implies $\sum_iF_i=0$ by differentiating $E(r_1+a,\ldots,r_N+a)$ with respect to $a$.

The distinction is visible in a small spring configuration. Rotate the positions and compare the transported force arrows with forces recomputed from the rotated geometry. Translation moves the configuration but contributes no offset to the force vectors.

<div data-es98e-animation="molecular-symmetry" />

Pairwise distances and angles give rotation/translation-invariant scalar inputs. They do not automatically remove ordering dependence or guarantee a complete geometric representation; distances also identify mirror-related configurations. Whether reflections should be a symmetry depends on the target. Invariant energy models yield equivariant conservative forces by differentiation, assuming sufficient smoothness. Architectures with equivariant internal tensor features can retain directional information before forming an invariant energy.

Data augmentation exposes the model to transformed inputs, but does not generally enforce exact symmetry. An architecture enforces a symmetry only when every operation, feature and readout respects the required action. Claims about exact physical behaviour must therefore include the full computation, not just one equivariant layer.

<h2 id="architectures">Different structures call for different sharing rules</h2>

A convolution applies the same local filter at each location. On an ideal translation-compatible domain this is translation equivariant; finite padding, strides, pooling and boundaries can restrict the exact symmetry. Pooling can reduce spatial resolution and support approximate invariance, but invariance is not a universal property of a CNN. U-Net combines resolutions for spatially resolved predictions such as segmentation.

Residual networks, introduced in the [previous chapter](/notes/es98e/neural-learning#residuals), share an identity route across depth. Their purpose is to ease learning changes to a representation; they can be combined with convolution or graph operations.

Self-attention instead computes data-dependent interactions between elements. Without positional encodings or order-dependent masks, ordinary self-attention is permutation equivariant. Positional information and causal masks change this statement; sequence transformers are not automatically permutation equivariant once their complete inputs and masks are fixed. Attention can model long-range relationships at the cost of pairwise interactions.

Graphs specify which elements should communicate. Molecules, meshes and networks have variable size and no privileged node ordering. A graph neural network shares its local update rule across nodes, allowing a single parameter set to operate on different graph sizes.

<h2 id="message-passing">A local update that can travel</h2>

For clarity, use an undirected graph with symmetric adjacency $A\in\{0,1\}^{N\times N}$. Let $H_k\in\mathbb R^{d_k\times N}$ contain node embeddings as **columns**, and $h_k^{(n)}$ denote column $n$. Atomic species can be encoded by one-hot features (the source uses 118 element categories); geometry requires additional information such as distances or directional features. A simple source-style update is

$$
h_{k+1}^{(n)}=\phi\!\left(b_k+W_k\left[h_k^{(n)}+\sum_{m\in\mathcal N(n)}h_k^{(m)}\right]\right),
$$

$$
H_{k+1}=\phi\!\left(b_k\mathbf1^T+W_kH_k(A+I)\right).
$$

The weights apply to both the node itself and its neighbour sum. Shared parameters and commutative aggregation are what remove dependence on neighbour order. After $K$ layers, each embedding can depend on its $K$-hop neighbourhood. Powers of an unweighted adjacency count walks of corresponding length, explaining how repeated propagation carries information, though nonlinear learned updates are not simply powers of $A$.

Consider the path graph with three scalar node features $(1,2,4)$ and take $W=1$, $b=0$, identity activation. The update yields $(3,7,6)$. Change the labels and follow the same update: the values should move with their nodes, without changing the graph's aggregate.

<Figure id="es98e-graph-relabel" title="Messages follow edges, not array positions" caption="Exact linear message passing on a three-node undirected path: add the node's value and its neighbours' values. Relabelling reverses the storage order. Updated values reverse from (3,7,6) to (6,7,3), while their mean stays 16/3. This teaching example has no trained parameters.">
  <svg data-es98e-diagram="graph-permutation" role="img" aria-label="Path graph features 1,2,4 update to 3,7,6. Reversed node order gives 6,7,3; mean 16/3 is invariant." viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg"><g fontSize="16" fontFamily="inherit" fill="currentColor"><text x="18" y="28" fontWeight="600">Original storage order</text><line x1="75.000" y1="95.000" x2="200.000" y2="95.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="200.000" y1="95.000" x2="325.000" y2="95.000" stroke="currentColor" strokeWidth="1.5"  /><circle cx="75" cy="95" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="75" y="101" textAnchor="middle">1</text><text x="75" y="151" textAnchor="middle">→ 3</text><circle cx="200" cy="95" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="200" y="101" textAnchor="middle">2</text><text x="200" y="151" textAnchor="middle">→ 7</text><circle cx="325" cy="95" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="325" y="101" textAnchor="middle">4</text><text x="325" y="151" textAnchor="middle">→ 6</text><text x="34" y="199" >self + neighbours → mean = 16/3</text><text x="18" y="278" fontWeight="600">Reverse storage order</text><line x1="75.000" y1="345.000" x2="200.000" y2="345.000" stroke="currentColor" strokeWidth="1.5"  /><line x1="200.000" y1="345.000" x2="325.000" y2="345.000" stroke="currentColor" strokeWidth="1.5"  /><circle cx="75" cy="345" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="75" y="351" textAnchor="middle">4</text><text x="75" y="401" textAnchor="middle">→ 6</text><circle cx="200" cy="345" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="200" y="351" textAnchor="middle">2</text><text x="200" y="401" textAnchor="middle">→ 7</text><circle cx="325" cy="345" r="23" fill="var(--background-color)" stroke="var(--sci-accent)" strokeWidth="2" /><text x="325" y="351" textAnchor="middle">1</text><text x="325" y="401" textAnchor="middle">→ 3</text><text x="34" y="449" >self + neighbours → mean = 16/3</text></g></svg>
</Figure>

Degree matters: an unnormalised sum can grow with the number of neighbours. A commonly used GCN replaces $A+I$ by $\tilde D^{-1/2}(A+I)\tilde D^{-1/2}$, with $\tilde D$ its degree matrix. The [Kipf–Welling GCN](https://arxiv.org/abs/1609.02907) uses such a normalised propagation. More general message-passing layers use separate self and neighbour weights, learned messages and edge features. For a directed graph with “receiver, sender” adjacency, the column convention above needs $A^T$ on the right; the undirected assumption is doing real work here.

Now give one node a signal and watch it spread over several layers. This example uses a self-plus-neighbour average so magnitudes remain bounded. Reverse the storage order at any stage: the features travel with their nodes, and the commutative graph readout remains the same.

<div data-es98e-animation="message-waves" />

<h2 id="permutation">Why the symmetry survives every layer</h2>

Let $P$ be a permutation matrix. Relabelling gives $H_k'=H_kP$ and $A'=P^TAP$. Since $PP^T=I$, $\mathbf1^TP=\mathbf1^T$, and elementwise activation commutes with column permutation,

$$
\begin{aligned}
H_{k+1}'
&=\phi\!\left(b_k\mathbf1^T+W_kH_kP(P^TAP+I)\right)\\
&=\phi\!\left((b_k\mathbf1^T+W_kH_k(A+I))P\right)
=H_{k+1}P.
\end{aligned}
$$

Induction proves node-level equivariance for the whole stack. Mean pooling $h_G=N^{-1}H_K\mathbf1$ is invariant because $P\mathbf1=\mathbf1$. A final map can produce a scalar regression output or softmax class probabilities. Sum pooling is also invariant and often more appropriate for extensive quantities such as total energy; mean pooling can erase graph-size information. Neither choice alone guarantees generalisation to unseen graph sizes or compositions.

The source reports an ethanol relabelling test and application to propanol. Those are useful implementation checks, not substitutes for the proof or evidence of arbitrary molecular transfer. Plain connectivity and atomic numbers also omit geometry; predicting geometrically dependent energy requires suitable geometric features or equivariant representations. Repeated aggregation can blur node distinctions, and limited neighbourhoods may miss long-range interactions.

Architectural symmetry is one way to supply scientific knowledge. The next chapter supplies a different kind: [a differential equation](/notes/es98e/differential-equations) that the prediction should satisfy.
