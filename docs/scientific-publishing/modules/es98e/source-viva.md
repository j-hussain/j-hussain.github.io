---
layout: page
title: "ES98E: Scientific Machine Learning"
type: module
---

**Side note:** rather than a full collection of lecture notes, this page contains my preparation for the viva-voce examination questions. This is a large page, and I will optimise it to consist of subpages at a later date!

# ES98E Scientific Machine Learning: Viva Voce Preparation Guide

**Comprehensive answers for all listed questions — Lectures 1–8**

University of Warwick · James Kermode & Tim Sullivan

## How to use this guide

Each answer is written to flow like a spoken response: it motivates the question, builds up the concepts in the order the lectures do, explains why each step follows from the last, and finishes with a clean summary of strengths and limitations. Every equation is followed by a legend defining all symbols. The viva is open book, so use this for practising how to explain, not for memorising.

---

## Part A: All Students (Lectures 5–8)

### 1 When training a neural network, what is the connection between the mean squared error loss function and a probabilistic interpretation of the regression process?

To answer this well, it helps to first ask: why do we minimise squared errors at all? One natural justification comes from choosing the model parameters that make the observed data as probable as possible under some noise model — this is maximum likelihood estimation (MLE).

**Setting up the probabilistic model.** Suppose we observe a target $y_i$ that equals the true model output plus some random measurement error:

$$y_i = f(x_i; w) + \varepsilon, \quad \varepsilon \sim \mathcal{N}(0, \sigma^2)$$

where:
- $y_i$: observed output for data point $i$
- $x_i$: input vector
- $w$: network weights (parameters to learn)
- $f(x_i; w)$: model prediction
- $\varepsilon$: i.i.d. Gaussian noise with variance $\sigma^2$

This assumption is common and reasonable whenever errors come from many small independent sources (a consequence of the central limit theorem). It gives each observation a Gaussian likelihood:

$$p(y_i | x_i, w) = \mathcal{N}(y_i | f(x_i; w), \sigma^2)$$

**Writing the joint likelihood.** If observations are independent, the joint probability of the whole dataset factorises:

$$p(y_{1:n} | x_{1:n}, w) = \prod_{i=1}^n \mathcal{N}\left(y_i \mid f(x_i; w), \sigma^2\right)$$

where:
- $n$: number of training observations
- $y_{1:n}$: all observed outputs
- $x_{1:n}$: all observed inputs

**From likelihood to loss.** Maximising this product is numerically difficult (products of small numbers underflow), so we take the log. Since log is monotone, the maximiser is unchanged. Taking the negative gives a minimisation objective:

$$-\log p(y_{1:n} | x_{1:n}, w) = \frac{n}{2}\log(2\pi\sigma^2) + \frac{1}{2\sigma^2}\sum_{i=1}^n [y_i - f(x_i; w)]^2$$

The first term is a constant and disappears when we differentiate with respect to $w$. We are left minimising only the sum of squared residuals, which (after dividing by $n$) is exactly the MSE:

$$L(w) = \frac{1}{n}\sum_{i=1}^n [y_i - f(x_i; w)]^2$$

where:
- $L(w)$: mean squared error loss
- $y_i - f(x_i; w)$: residual (prediction error) at data point $i$

**Key conclusion.** Minimising MSE $\equiv$ MLE under i.i.d. Gaussian noise. The probabilistic view gives us two extra things for free:

1. The MLE noise estimate $\hat{\sigma}^2 = \frac{1}{n}\sum_i [y_i - f(x_i; w_{\text{MLE}})]^2$, i.e. the mean squared residual.
2. An interpretation of $\ell_2$ weight regularisation — adding $\lambda\|w\|_2^2$ to the loss is equivalent to placing a Gaussian prior $p(w) = \mathcal{N}(0, \lambda^{-1}I)$ on the weights and doing MAP estimation instead of MLE.

### 2 Describe the purpose of an activation function in a neural network. What are the advantages and disadvantages of choosing (i) tanh(x) or (ii) ReLU(x) as activation functions?

**Why activation functions are necessary.** A deep neural network without activation functions is just a sequence of linear maps: $y = W_L(W_{L-1}(\cdots W_1 x))$. Because the composition of linear maps is itself a linear map, the entire stack collapses to a single matrix multiplication regardless of depth, and the network can only represent linear functions of the input. To model the non-linear relationships present in real data, we apply an element-wise non-linear activation function $\phi(\cdot)$ after each linear layer:

$$h_\ell = \phi(W_\ell h_{\ell-1} + b_\ell)$$

where:
- $h_\ell$: hidden activations at layer $\ell$
- $W_\ell$: weight matrix at layer $\ell$
- $b_\ell$: bias vector at layer $\ell$
- $\phi(\cdot)$: element-wise non-linear activation function

The universal approximation theorem (Cybenko 1989, Hornik 1991) formalises this: a sufficiently wide MLP with a non-linear activation can approximate any continuous function on a compact domain to arbitrary precision.

**(i) tanh(x) $= \frac{e^x - e^{-x}}{e^x + e^{-x}}$:** This was widely used in the early days of deep learning. Its advantages are that it is zero-centred (outputs in $(-1, 1)$, unlike sigmoid which is in $(0, 1)$), smooth everywhere, and strictly monotone. The critical problem, however, is saturation: for large $|x|$, the derivative $\phi'(x) = 1 - \tanh^2(x)$ tends to zero. During backpropagation, the chain rule means the gradient of the loss with respect to weights in layer $\ell$ involves a product of derivatives across all subsequent layers:

$$\frac{\partial L}{\partial w^{(\ell)}} \propto \prod_{k>\ell} \phi'(z_k)$$

where:
- $z_k$: pre-activation at layer $k$
- $\phi'(z_k) \to 0$ when $|z_k|$ is large, causing each factor in the product to be less than 1

so the gradient shrinks exponentially with depth. This vanishing gradient problem makes it practically impossible to train deep networks with tanh.

**(ii) ReLU(x) $= \max(0, x)$:** This is now the default choice. For $x > 0$, $\phi'(x) = 1$ exactly — the gradient passes through unchanged, so deep networks can be trained without gradients vanishing. ReLU is also computationally trivial and produces sparse activations (many units output zero), which can act as implicit regularisation. The main drawback is the dying ReLU problem: if a unit consistently receives negative inputs, it outputs zero and has zero gradient, so it never updates and is effectively dead for the rest of training. The Leaky ReLU (which uses a small slope $\alpha \ll 1$ for $x < 0$) addresses this by allowing a small non-zero gradient in the negative region.

### 3 What is stochastic gradient descent and why is it useful when training a neural network?

**The problem with full gradient descent.** The natural approach to minimising the training loss is gradient descent: compute the gradient of $L(w)$ over the full dataset, then take a step in the negative gradient direction:

$$w_{t+1} = w_t - \eta \nabla_w L(w_t), \quad L(w) = \frac{1}{n}\sum_{i=1}^n \ell(w; x_i, y_i)$$

where:
- $w_t$: weight vector at step $t$
- $\eta > 0$: learning rate
- $\ell(w; x_i, y_i)$: per-sample loss
- $n$: full dataset size

This is $O(n)$ per step, which is prohibitive for modern datasets with millions of examples. Worse, the loss surface for a deep network is non-convex with many local minima; the deterministic dynamics of full gradient descent can easily get trapped.

**Stochastic gradient descent.** The Robbins–Monro (1951) algorithm instead draws a random mini-batch $B \subset \{1, \ldots, n\}$ of size $m \ll n$ and uses it as a noisy but unbiased estimator of the true gradient:

$$w_{t+1} = w_t - \eta \nabla_w L_B(w_t), \quad L_B = \frac{1}{m}\sum_{i \in B} \ell(w; x_i, y_i)$$

where:
- $B$: randomly sampled mini-batch of training indices
- $m = |B|$: batch size (typically 32–512; much smaller than $n$)
- Unbiasedness: $\mathbb{E}_B[\nabla L_B] = \nabla L$, so on average we are moving in the right direction

**Why it is useful — four reasons.**

1. **Computational efficiency.** Each update costs $O(m)$ instead of $O(n)$, so we can perform many more gradient steps per unit of compute. An epoch (one full pass through data) now consists of $n/m$ updates rather than one.

2. **Escaping local minima.** The stochastic noise acts like thermal fluctuations: the optimiser is occasionally pushed uphill, allowing it to escape shallow local minima that full gradient descent would get stuck in.

3. **Implicit regularisation.** This is perhaps the deepest reason. The discrete mini-batch update with step size $\eta$ effectively minimises an augmented loss:

$$L_{\text{SGD}}(w) \approx L(w) + \frac{\eta}{4}\|\nabla_w L\|^2 + \frac{\eta}{4m}\sum_b \|\nabla L_b - \nabla L\|^2$$

The extra terms penalise steep gradients and gradient variance across batches. This pushes the optimiser toward flat minima — regions where the loss is insensitive to small weight perturbations — which are empirically known to generalise better than sharp minima.

4. **Practical variants.** Adam (adaptive moment estimation) maintains running averages of the gradient and its square to adaptively scale learning rates per parameter. It is the most widely used variant in practice.

### 4 What are noise, bias and variance and how does the trade-off between them manifest when fitting linear and non-linear models?

These three quantities decompose the total test error of any learning algorithm and explain the fundamental tension in choosing model complexity.

**Noise** (aleatoric uncertainty) is the irreducible randomness in the data generation process itself. Even if we had infinite data and the perfect model, we could never predict below the floor set by $\sigma^2 = \text{Var}(\varepsilon)$, where $\varepsilon \sim \mathcal{N}(0, \sigma^2)$ is the measurement noise. It is a property of the data, not the model.

**Bias** quantifies how wrong the model is on average across all possible training sets. If $\bar{f}(x) = \mathbb{E}_D[f(x; w(D))]$ is the expected model prediction and $\mu(x) = \mathbb{E}[y | x]$ is the true conditional mean, then:

$$\text{bias}^2(x) = \left[\bar{f}(x) - \mu(x)\right]^2$$

A model that is too simple to express the true function will always predict something systematically wrong — this is underfitting.

**Variance** quantifies how sensitive the model is to which training set it happens to see. A very flexible model might fit the training data almost perfectly but change dramatically if a different training set is used:

$$\text{var}(x) = \mathbb{E}_D\left[f(x; w(D)) - \bar{f}(x)\right]^2$$

High variance corresponds to overfitting.

**The bias–variance decomposition** of the expected squared test error at input $x$:

$$\mathbb{E}_{D,y}\left[f(x; w) - y\right]^2 = \underbrace{\text{bias}^2(x)}_{\text{model too simple}} + \underbrace{\text{var}(x)}_{\text{model too sensitive}} + \underbrace{\sigma^2}_{\text{irreducible}}$$

where:
- $D$: training dataset (a random variable)
- $f(x; w(D))$: model trained on $D$, evaluated at $x$
- $\bar{f}(x)$: best achievable average prediction (with infinite data)
- $\mu(x)$: true conditional mean
- $\mathbb{E}_{D,y}$: expectation over both training set realisations and observation noise

**How this manifests in practice.**

*Linear models (GLMs):* with a fixed set of $M$ basis functions, the model has limited expressiveness. Adding more basis functions (increasing $M$) reduces bias at the cost of higher variance. The optimal $M$ can be found via cross-validation or by maximising the Bayesian evidence. Regularisation (ridge regression adds $\lambda\|w\|_2^2$; Lasso adds $\lambda\|w\|_1$) pulls weights toward zero, effectively reducing the model's degrees of freedom and trading bias for variance.

*Neural networks:* increasing depth and width reduces bias because the network can represent increasingly complex functions. But a very large network trained on limited data will overfit: it memorises training noise (high variance). The bias–variance curve in the classical picture has a U-shape minimum. Interestingly, very large neural networks often defy this: once the network is large enough to interpolate all training data (the "interpolation threshold"), test error can decrease again as the network grows further — the so-called double descent phenomenon. SGD plays a central role here by implicitly favouring simpler solutions even in highly over-parametrised regimes.

### 5 Discuss why and how a deep neural network can be regularised.

**Why regularisation is necessary.** A deep neural network with millions of parameters trained on tens of thousands of examples is wildly over-parametrised: there are infinitely many weight configurations that achieve zero training loss. Without any constraint on which of these solutions we select, the network may memorise the training data perfectly but generalise poorly. Regularisation refers to any technique that constrains the solution space to prefer models that generalise.

**Explicit regularisation.** The most direct approach is to add a penalty $g(w)$ to the loss:

$$L_\lambda(w) = \frac{1}{n}\sum_{i=1}^n \ell_i(w) + \lambda g(w)$$

where:
- $\lambda > 0$: regularisation strength; larger $\lambda$ means more regularisation
- $g(w)$: penalty function that measures some notion of model complexity

Two natural choices mirror the Lasso and ridge regression from the linear setting:

- **L2 (weight decay):** $g(w) = \|w\|_2^2$. This has a clean probabilistic interpretation: it is equivalent to placing a Gaussian prior $\mathcal{N}(0, \lambda^{-1}I)$ on the weights. The penalty forces weights to remain small in magnitude, limiting the network's ability to exploit rare patterns in the training data.

- **L1:** $g(w) = \|w\|_1$. Drives some weights exactly to zero (sparsity), effectively performing automatic feature selection inside the network.

**Implicit regularisation via SGD.** This is more subtle but arguably more important in practice. The discrete SGD update with step size $\eta$ is not exactly gradient descent on $L(w)$; it effectively minimises:

$$L_{\text{SGD}}(w) \approx L(w) + \frac{\eta}{4}\|\nabla_w L\|^2$$

where $\|\nabla_w L\|^2$ is the squared norm of the full-data gradient; this penalises steep regions of the loss surface and favours flat minima, which empirically generalise better.

Mini-batching adds an additional term that penalises variance of the per-batch gradients. Together, this means SGD has a built-in preference for flat, wide minima even without any explicit penalty.

**Other regularisation methods.**

- **Early stopping:** monitor validation loss during training. Once it starts to rise, stop — the network is beginning to overfit. The number of training steps acts as an implicit regularisation parameter.

- **Dropout:** randomly set a fraction of activations to zero during each training forward pass. This prevents co-adaptation between units and is equivalent to training an ensemble of exponentially many sub-networks with shared weights. At test time, all units are active (weights scaled accordingly).

- **Ensembles:** train $K$ networks with different random initialisations and average their predictions. Variance is reduced by a factor of $\sim 1/K$ because individual errors cancel.

- **Bayesian neural networks:** maintain a full posterior distribution over weights rather than a point estimate. This treats the prior as an explicit regulariser. MCMC or variational inference (see Q19) can be used.

### 6 Why are alternatives to fully-connected dense neural networks needed? Give examples of alternative architectures.

**The limits of fully-connected networks.** In the examples covered so far in the module, inputs have been scalars or low-dimensional vectors. But consider real scientific inputs: a $256 \times 256$ image has 65,536 pixels; a molecule has a variable number of atoms with Cartesian coordinates; a finite-element mesh has thousands of nodes. A fully-connected layer connecting $D_{\text{in}}$ inputs to $H$ hidden units requires $D_{\text{in}} \times H$ parameters — for the image example with $H = 1000$ hidden units, this is $\sim$65 million parameters for a single layer. This is both memory-prohibitive and prone to overfitting.

Worse, a fully-connected network treats every input element as independent and applies a different weight to each. This means it cannot exploit structure in the data: it has no notion that nearby pixels in an image are more related than distant ones, or that the energy of a molecule should not depend on which atom you call "atom 1". These structural properties are called inductive biases, and incorporating them into the architecture makes learning vastly more data-efficient.

**Alternative architectures.**

- **Convolutional Neural Networks (CNNs):** instead of applying a different weight to every input, a CNN applies the same filter (small set of weights) at every spatial position. This weight sharing reduces parameters dramatically and makes the network equivariant to translation (shifting the input shifts the output by the same amount). Practical CNNs alternate convolutional and max-pooling layers; architectures like U-Net (2016) are widely used for image segmentation in scientific imaging.

- **Residual Networks (ResNets):** add skip connections so that $h_\ell = h_{\ell-1} + f_\ell(h_{\ell-1}, w_\ell)$. These address the shattered gradient problem that prevents standard deep networks from being trained effectively (see Q8).

- **Transformers:** use self-attention mechanisms that compute pairwise relationships between all input elements. The input is a sequence; the architecture is permutation-equivariant to that sequence. Transformers are the foundation of large language models (GPT, BERT) and are increasingly used in scientific ML for proteins and materials.

- **Graph Neural Networks (GNNs):** the input is a graph (adjacency matrix + node features). GNNs are automatically equivariant to permutation of the nodes, making them ideal for molecules, finite-element meshes, and social networks (see Q9).

### 7 What are invariance and equivariance and how do they relate to the use of neural networks for scientific machine learning applications?

**Defining the concepts.** A function $f$ is said to be invariant to a transformation $t(\cdot)$ if applying the transformation to the input leaves the output unchanged:

$$f(t(x)) = f(x)$$

It is equivariant if the output transforms in the same way as the input:

$$f(t(x)) = t(f(x))$$

where:
- $f$: the neural network (or any function)
- $t(\cdot)$: transformation (e.g. rotation, translation, permutation of atoms)
- Invariance: the output is a scalar (like energy) that should not change under the transformation
- Equivariance: the output is a vector (like atomic forces) that should transform in the same way as the input

**Why this is central to SciML.** Physical laws obey symmetries, and these symmetries constrain what any physical model — including a neural network — must satisfy. Consider a molecule: its potential energy $E$ is invariant to rotations, translations, and permutations of identical atoms (if you rotate a water molecule, it has the same energy). The forces on each atom, $F_i = -\nabla_{r_i} E$, are equivariant to rotation and translation: rotating the molecule rotates the forces by the same rotation matrix.

If we train a neural network without enforcing these constraints, it must learn them from data alone, which requires enormous datasets and may still fail to generalise reliably. Incorporating the symmetries into the architecture dramatically reduces the amount of data needed and guarantees exact symmetry at all times.

**Strategies for building symmetry into networks.**

1. **Data augmentation (naive):** add rotated/permuted copies of training data. Does not guarantee exact symmetry and is data-inefficient.

2. **Use invariant input features:** express inputs as pairwise distances $\|r_i - r_j\|$ and angles rather than Cartesian coordinates. These are automatically rotation- and translation-invariant, so any neural network operating on them produces invariant scalar outputs.

3. **Equivariant output via autodiff:** if $E(r)$ is built to be invariant (e.g. by using pairwise distances), then $F_i = -\nabla_{r_i} E$ is automatically equivariant. This is how modern ML interatomic potentials (NequIP, MACE) work: build an invariant energy model, get equivariant forces "for free" via automatic differentiation.

4. **GNNs for permutation symmetry:** using an adjacency matrix and summing over neighbours (see Q9) automatically makes the network permutation-equivariant at node level and permutation-invariant at graph level. In the lecture, this was verified explicitly by checking that relabelling the atoms of ethanol left the predicted energy unchanged.

5. **E(3)-equivariant networks:** libraries like e3nn use spherical harmonics to build networks with full SO(3)/E(3) equivariance, capturing not just scalars but higher-order tensor properties.

### 8 Describe the residual neural network architecture and explain why it is useful.

**The problem: shattered gradients.** It is tempting to think that a deeper neural network is always better, since it can represent more complex functions. In practice, however, adding more layers to a standard MLP or CNN eventually hurts performance. The reason is the shattered gradient problem (Balduzzi, 2017): as depth $K$ increases, the input-output gradient $dy/dx$ progressively loses spatial correlation and starts to resemble white noise. Gradient descent relies on the loss landscape being smooth and well-conditioned; once gradients are white noise, the landscape is effectively flat from the optimiser's perspective and training stalls.

Concretely, a standard $L$-layer network computes:

$$y = f_L(f_{L-1}(\cdots f_1(x))) = (f_L \circ f_{L-1} \circ \cdots \circ f_1)(x)$$

and the gradient of the loss with respect to early-layer weights involves a chain of Jacobians multiplied together — each one with entries bounded below 1 for saturating activations, causing the gradient to vanish.

**The residual solution.** He et al. (2016) proposed adding skip connections that directly add the input of each block back to its output:

$$h_\ell = h_{\ell-1} + f_\ell(h_{\ell-1}, w_\ell)$$

where:
- $h_\ell$: hidden state at layer $\ell$
- $h_{\ell-1}$: skip connection (the input to the block, passed unchanged to the output)
- $f_\ell(h_{\ell-1}, w_\ell)$: the residual function (what the block learns to add)
- $w_\ell$: weights of block $\ell$

There are two key consequences. First, the gradient can now flow directly through the skip connections all the way back to early layers without passing through any weight matrices, avoiding shattering. Second, the network only needs to learn the residual $f_\ell$ rather than the full transformation: if the optimal block contribution is zero, it suffices to learn $f_\ell = 0$, which is easy (initialise weights near zero), rather than learning an identity mapping, which is hard.

**Interpretations.** Unrolling the skip connections reveals that the output is a sum of the input and many different shorter sub-networks (corresponding to paths that skip some blocks). This can be interpreted as an implicit ensemble, which also explains why gradients from the loss reach early layers through many short paths rather than one long fragile chain. Interestingly, the continuous limit of an infinitely deep ResNet (with shared weights) is a Neural ODE: $\frac{dh}{dt} = f(h(t), w)$, where $t$ indexes depth.

**Batch normalisation.** Residual connections fix shattering, but introduce a new problem: adding inputs to outputs at each layer can cause the variance of activations to grow exponentially with depth (exploding gradients). Batch normalisation addresses this by normalising each layer's outputs within a mini-batch and then applying learned scale and shift parameters $\gamma$ and $\delta$:

$$h_i \leftarrow \frac{h_i - m_h}{s_h + \epsilon}, \quad h_i \leftarrow \gamma h_i + \delta$$

where:
- $m_h, s_h$: empirical mean and standard deviation of the layer outputs over the current mini-batch
- $\epsilon$: small constant to prevent division by zero
- $\gamma, \delta$: learnable scale and shift (restored after normalisation so the network can still represent any function)

keeping the distribution of activations stable throughout training.

### 9 What is a graph neural network? Outline the key ideas of a graph convolutional network for graph classification or regression tasks.

**Motivation: when the input is a graph.** Many problems in scientific machine learning naturally have graph-structured inputs. A molecule is a graph where atoms are nodes and chemical bonds are edges. A finite-element mesh is a graph where elements share edges. A social network is a graph where people share connections. In each case, the key information is not just the features at each node, but the relationship structure encoded by the graph.

**Representing a graph.** A graph with $N$ nodes and $E$ edges is characterised by:

- The adjacency matrix $A \in \{0, 1\}^{N \times N}$, where $A_{nm} = 1$ if there is an edge from node $m$ to node $n$. Crucially, $A^k$ encodes the number of walks of length $k$ between pairs of nodes, so powers of $A$ propagate information through the graph.

- The node embedding matrix $X \in \mathbb{R}^{D \times N}$, whose column $n$ is the feature vector of node $n$. For molecules in the lecture, nodes were encoded as one-hot vectors of length 118 (one per element in the periodic table).

**The graph convolutional network (GCN).** The fundamental idea of a GCN is message passing: each node collects information from its neighbours, combines it with its own features, applies a linear transformation and a non-linearity, and produces an updated embedding. This is done iteratively over $K$ layers, so after $K$ steps each node's embedding encodes information about its $K$-hop neighbourhood.

Concretely, in layer $k$, node $n$ first aggregates its neighbours' embeddings:

$$\text{agg}(n, k) = \sum_{m \in \text{neigh}(n)} h^{(m)}_k$$

where:
- $\text{neigh}(n)$: set of node indices adjacent to $n$
- $h^{(m)}_k$: embedding of node $m$ at layer $k$ (a $D$-dimensional vector)

Then it updates its own embedding using both its current embedding and the aggregation:

$$h^{(n)}_{k+1} = a\left(\beta_k + \Omega_k h^{(n)}_k + \Omega_k \text{agg}(n, k)\right)$$

where:
- $a(\cdot)$: element-wise activation (e.g. ReLU)
- $\beta_k$: bias vector at layer $k$
- $\Omega_k$: weight matrix at layer $k$ (the same matrix is shared across all nodes)

Note: the same $\Omega_k$ is applied to both self and neighbour embeddings.

Collecting all $N$ node embeddings into the matrix $H_k \in \mathbb{R}^{D \times N}$ (columns are node embeddings), this can be written more efficiently as:

$$H_{k+1} = a\left(\beta_k \mathbf{1}^{\top} + \Omega_k H_k(A + I)\right)$$

where:
- $H_k$: node embedding matrix at layer $k$
- $\mathbf{1}^{\top}$: row vector of ones (broadcasts the bias across all nodes)
- $A$: adjacency matrix (encodes which nodes to aggregate from)
- $I$: $N \times N$ identity (adds self-loops so each node includes its own embedding in the aggregation)
- $(A + I)$: effective adjacency with self-loops

**Graph-level output.** After $K$ layers, the final node embeddings are aggregated into a single graph-level representation by averaging (a permutation-invariant operation), then passed through a final linear layer to produce a scalar (regression) or class probabilities (classification).

**Why permutation invariance is automatic.** If we relabel the nodes using permutation matrix $P$, then $A \to P^{\top}AP$ and $X \to XP$. Substituting into the update rule: $H_{k+1}P = a(\ldots H_k P(P^{\top}AP + I))$. The columns of $H_{k+1}$ are simply reordered — and since we then average the columns, the graph-level output is unchanged. In the lecture, this was verified concretely: randomly permuting the atoms of ethanol left the GCN's predicted energy identical to machine precision. The model also worked on propanol (a different graph of different size) with no modification, demonstrating the architecture's flexibility.

### 10 How can neural networks be used to solve differential equations? What are the benefits compared to traditional scientific computing techniques?

**The motivation: combining data and physics.** Traditional scientific computing solves differential equations using numerical methods (finite differences, finite elements, Runge–Kutta). These methods are well-understood and highly accurate, but they require the ODE/PDE structure to be fully specified. In many real problems, parts of the model are unknown and must be learned from data. Neural networks provide a flexible, differentiable function approximator that can serve this role.

**The Lagaris approach.** Lagaris (1998) made the key observation that we can represent the solution of an ODE as a neural network and train it by minimising the residual of the equation. Consider:

$$\frac{du}{dx} = f(x, u), \quad u(0) = u_0$$

The initial condition can be satisfied by construction using the trial solution:

$$y_t(x; w) = u_0 + x \cdot g(x; w)$$

where:
- $y_t(x; w)$: trial solution (a neural network); note $y_t(0) = u_0$ automatically since the $x$ factor is zero at $x = 0$
- $g(x; w)$: neural network to be trained (represents the "correction" from the initial value)
- $w$: network weights

where $g(x; w)$ is a neural network. The loss minimises the squared ODE residual at a set of collocation points:

$$L(w) \approx \frac{1}{N_c}\sum_{N_c}^{j=1} \left[\frac{dy_t}{dx}\bigg|_{x_j} - f(x_j, y_t(x_j; w))\right]^2$$

where:
- $N_c$: number of collocation points
- $x_j$: collocation point (where the ODE residual is evaluated)
- $dy_t/dx$: computed via automatic differentiation, not finite differences — this is crucial because it is exact to machine precision

In the lecture, this approach was demonstrated on the ODE $f(x, y) = e^{-x/5}\cos(x) - y/5$, which has the analytic solution $y(x) = e^{-x/5}\sin(x)$. The NN solution matched the analytic result to high precision and generalised well beyond the training domain.

**Neural ODEs.** A more powerful extension (Chen, 2018) replaces the entire right-hand side of an ODE with a neural network:

$$\frac{dy}{dt} = g(t, y(t); w)$$

and integrates using a differentiable ODE solver (e.g. Runge–Kutta via the diffrax library). The key insight is that modern automatic differentiation frameworks can differentiate through the ODE solver, so the solver becomes part of the computational graph and gradients flow through it during training. This is the continuous-depth limit of a ResNet (the residual update $h_\ell = h_{\ell-1} + f_\ell(h_{\ell-1})$ is an Euler step of $\frac{dh}{dt} = f(h, t)$).

**Benefits over traditional scientific computing.**

- Can learn unknown parts of a model from data (e.g. the ODE RHS), which is not possible with classical solvers alone.

- Mesh-free: no spatial grid is needed; collocation points can be placed anywhere and chosen adaptively.

- Fast at inference once trained: evaluation is just a forward pass through the network.

- Can generalise to nearby initial/boundary conditions without retraining (to some extent).

**Limitations:** PINNs are notoriously hard to train because the physics and data loss terms compete, and their relative weighting $\lambda$ is problem-specific and fragile. They can violate causality in time-dependent problems if the collocation points are not ordered correctly. For well-understood PDEs, classical solvers remain faster and more reliable.

### 11 What is meant by a physics informed neural network? What are the advantages and disadvantages compared to supervised learning?

**The key idea.** Physics-Informed Neural Networks (PINNs), introduced by Raissi et al. (2019), are a natural extension of the Lagaris approach to PDEs. The central insight is that physical laws (expressed as PDEs) can be incorporated directly into the training loss, so that the network is simultaneously fitted to any available data and constrained to satisfy the governing equations. This is a form of regularisation: the physics term discourages solutions that fit the data but violate the known physics.

The loss takes the form:

$$L = \frac{1}{N_d}\sum_{i=1}^{N_d} (y_i - u(x_i; w))^2 + \lambda \frac{1}{N_c}\sum_{j=1}^{N_c} R(u(x_j; w))^2 + \text{BC/IC terms}$$

where:
- $N_d$: number of labelled data points
- $y_i$: observed output at data point $i$
- $u(x_i; w)$: neural network solution
- $\lambda > 0$: weight balancing physics against data (a critical and difficult hyperparameter)
- $N_c$: number of collocation points where the PDE is enforced
- $R(u) = \mathcal{N}[u] - f$: PDE residual, where $\mathcal{N}[\cdot]$ is the differential operator and $f$ is the source term
- BC/IC terms: losses enforcing boundary and initial conditions

All derivatives needed to evaluate $R(u)$ (which may include spatial and temporal derivatives of $u$) are computed via automatic differentiation.

**Advantages over supervised learning.**

- **Works with sparse data.** A supervised network requires labelled outputs at many input locations. A PINN only needs data at a handful of points; the PDE provides a continuous constraint across the entire domain.

- **Enforces prior physical knowledge.** The solution is constrained to be physically plausible, preventing the network from learning spurious patterns.

- **Mesh-free.** Collocation points $\{x_j\}$ can be placed freely and densely in regions of interest.

- **Useful for inverse problems.** If the PDE contains unknown parameters (e.g. viscosity, diffusivity), these can be added to $w$ and inferred from sparse observations simultaneously with the solution.

**Disadvantages.**

- **Hard to train.** Balancing $\lambda$ between data and physics terms is problem-specific and fragile. The optimisation landscape has many saddle points and the two losses can compete destructively.

- **Often slower than classical solvers.** For well-characterised PDEs, established numerical methods (FEM, FDM) are faster, more reliable, and have rigorous error bounds. PINNs are most valuable where classical methods struggle.

- **Approximate enforcement.** The PDE residual is only minimised to zero at the collocation points, not everywhere. Causality can be violated in time-dependent problems.

- **Not transferable.** Each PINN is trained for a specific set of BCs/ICs. Changing the boundary conditions requires retraining. Neural Operators (FNO, DeepONet) learn the solution operator instead and can handle varying conditions after a single training phase.

### 12 What is meant by unsupervised learning and how does it differ from supervised learning?

**The defining difference: labels.** In supervised learning, the training data consists of input-output pairs $\{(x_i, y_i)\}_{i=1}^N$. The goal is to learn a mapping $f : x \mapsto y$ that generalises to unseen inputs, and the loss function directly measures how well predictions match known labels. Examples from the module include linear regression, Gaussian process regression, and deep neural network regression.

In unsupervised learning, only inputs $\{x_i\}_{i=1}^N$ are available — there are no labels. The goal is to discover structure, patterns, or a compact representation of the data distribution $p(x)$ from the data itself. This is much harder because there is no direct feedback signal. However, it is enormously valuable because labelled data is expensive to collect, while unlabelled data (e.g. raw sensor measurements, unannotated molecular configurations) is cheap and abundant.

**What unsupervised learning does.** There are several distinct tasks, all sharing the absence of labels:

1. **Clustering:** identify groups of similar examples without knowing group labels in advance. K-means assigns each point to its nearest cluster centre; Gaussian Mixture Models (GMMs) provide a probabilistic version with soft assignments.

2. **Dimensionality reduction:** find a low-dimensional representation that captures the essential structure of the data. PCA finds the linear subspace of maximal variance; VAEs learn non-linear representations.

3. **Density estimation and generation:** learn the underlying distribution $p(x)$ so that new, realistic samples can be generated. VAEs, GANs, normalising flows, and diffusion models all do this.

4. **Anomaly detection:** flag examples that have low probability under the learned distribution, indicating they may be outliers or faulty measurements.

**The probabilistic connection.** Both supervised and unsupervised learning can be unified under a probabilistic framework. Supervised learning maximises $p(y | x, w)$ (the conditional likelihood of the labels). Unsupervised learning maximises $p(x | \phi)$ (the marginal likelihood of the inputs). This marginal likelihood is what latent variable models (K-means, PCA, VAEs) all aim to maximise.

### 13 What is a latent variable model and how can it be used to generate samples with similar properties to a set of observed data?

**The core idea.** Many high-dimensional datasets have a simpler underlying structure than their raw dimensionality suggests. A latent variable model makes this explicit: it posits that each observed data point $x$ was generated by first drawing a low-dimensional latent (hidden) variable $z$ and then passing it through a generative process:

$$z \sim p(z), \quad x \sim p(x | z, \phi)$$

where:
- $z$: latent variable (low-dimensional, unobserved; encodes the underlying explanatory factors)
- $p(z)$: prior over latent variables (typically $\mathcal{N}(0, I)$)
- $x$: observed data (high-dimensional)
- $\phi$: learnable parameters of the generative model
- $p(x | z, \phi)$: likelihood (the forward/generative map from latent to data space)

The marginal distribution of the data is obtained by integrating out the latent variable:

$$p(x | \phi) = \int p(x | z, \phi) p(z) \, dz$$

The parameters $\phi$ are learned by minimising the negative log-likelihood $-\sum_n \log p(x_n | \phi)$ over the training data.

**Generating new samples.** Once $\phi$ is learned, generating new samples is straightforward through ancestral sampling:

1. Draw $z^* \sim p(z) = \mathcal{N}(0, I)$ (sample from the simple prior).
2. Pass through the generative model: $x^* \sim p(x | z^*, \phi)$.

The key insight is that sampling from a high-dimensional, complex distribution $p(x)$ is hard, but sampling from the low-dimensional prior $p(z)$ is trivially easy. The learned model $p(x | z, \phi)$ does the heavy lifting of mapping simple samples to realistic data.

**Spectrum of examples from the module.**

- **K-means:** discrete latent variable $z \in \{1, \ldots, K\}$ (cluster assignment). The forward model is just the cluster centre $\mu_k$.

- **Probabilistic PCA:** continuous Gaussian $z$; linear forward model $x = Wz + \mu + \varepsilon$. Analytic solution for the model parameters.

- **Variational Autoencoder (VAE):** continuous Gaussian $z$; non-linear forward model $x \sim \mathcal{N}(f(z, \phi), \sigma^2 I)$ where $f$ is a neural network. Non-analytic; trained via the ELBO.

- **GANs / diffusion models:** increasingly powerful generative models for images, molecules, etc.; current state-of-the-art for high-quality generation.

### 14 What is principal component analysis and what can it be used for?

**The intuition.** High-dimensional data often lies near a lower-dimensional subspace. PCA finds this subspace. Imagine $N$ data points in $D$ dimensions: PCA finds the $M < D$ orthogonal directions that capture the most variance, projects all points onto them, and discards the remaining $D - M$ directions.

**Maximum variance derivation.** Start with $M = 1$. We want a unit vector $u_1$ that maximises the variance of the projected data $\{(u_1^{\top}x_n)\}$. The projected variance is:

$$\frac{1}{N}\sum_{n=1}^N (u_1^{\top}x_n - u_1^{\top}\bar{x})^2 = u_1^{\top} S u_1$$

subject to $\|u_1\| = 1$, where:
- $\bar{x}$: sample mean ($\frac{1}{N}\sum_n x_n$)
- $S = \frac{1}{N}\sum_n (x_n - \bar{x})(x_n - \bar{x})^{\top}$: $D \times D$ sample covariance matrix

Using a Lagrange multiplier gives the eigenvalue equation:

$$Su_1 = \lambda_1 u_1$$

So $u_1$ is the leading eigenvector of $S$, and the maximised variance is $\lambda_1$, the leading eigenvalue. Further principal components are eigenvectors with decreasing eigenvalues, each orthogonal to the previous. In practice, these are computed via truncated SVD rather than directly forming and decomposing $S$.

**Forward and inverse transforms.**

$$X' = (X - \bar{x})U_M, \quad \tilde{X} = X'U_M^{\top} + \bar{x}$$

where:
- $X$: $N \times D$ data matrix (rows are data points, after subtracting mean)
- $U_M$: $D \times M$ matrix whose columns are the $M$ leading principal components
- $X'$: $N \times M$ projected (reduced) data
- $\tilde{X}$: $N \times D$ reconstruction
- Reconstruction error: $L_M = \sum_{j>M} \lambda_j$ (sum of discarded eigenvalues)

**What PCA can be used for.**

- **Visualisation:** project 40-dimensional MNIST1D data to 2D for visual inspection. In the lecture, related digit configurations appeared close together in the reduced space, and the mapping generalised well to test data.

- **Compression:** store $X'$ ($N \times M$) instead of $X$ ($N \times D$), with a controllable trade-off between compression ratio and reconstruction error.

- **Pre-processing:** decorrelate input features before feeding to another model, which can help conditioning.

- **Anomaly detection:** points with high reconstruction error $\|x - \tilde{x}\|^2$ are unusual.

**Limitation.** PCA is a linear projection. It cannot capture non-linear structure in the data. Kernel PCA applies the kernel trick to use non-linear feature maps implicitly; VAEs use a neural network decoder to learn an explicitly non-linear generative model.

### 15 Describe the probabilistic variant of principal component analysis and how it can be used to generate new samples similar to those occurring in a given dataset.

**From PCA to a generative model.** Standard PCA gives a geometric construction (eigenvectors of the covariance matrix) but does not define a probability distribution over the data. Probabilistic PCA (pPCA, Tipping & Bishop 1999) reinterprets PCA as a latent variable model, which immediately gives it a generative interpretation.

The model is:

$$x = Wz + \mu + \varepsilon, \quad z \sim \mathcal{N}(0, I_M), \quad \varepsilon \sim \mathcal{N}(0, \sigma^2 I_D)$$

where:
- $W$: $D \times M$ weight matrix (the learned linear map from latent to data space)
- $z$: $M$-dimensional latent variable (prior: standard Gaussian)
- $\mu$: $D$-dimensional mean (ML estimate: sample mean $\bar{x}$)
- $\varepsilon$: isotropic Gaussian noise
- $\sigma^2$: noise variance (ML estimate: average variance in the $D - M$ discarded directions)
- $I_M, I_D$: identity matrices of size $M$ and $D$ respectively

The data was generated by drawing a low-dimensional latent code $z$, mapping it linearly into data space, and adding noise. This is a generative model: we have specified how data is produced.

**Marginal distribution.** Integrating out $z$ (both prior and likelihood are Gaussian, so the marginal is also Gaussian):

$$p(x) = \mathcal{N}(x | \mu, C), \quad C = WW^{\top} + \sigma^2 I$$

where:
- $C$: $D \times D$ marginal covariance
- $WW^{\top}$: variance from the latent structure
- $\sigma^2 I$: isotropic noise contribution

**ML solution.** The maximum likelihood estimates are: $\hat{\mu} = \bar{x}$ and $\hat{W} = U_M(L_M - \sigma^2 I)^{1/2}R$, where $U_M$ are the leading eigenvectors of the sample covariance, $L_M$ contains their eigenvalues, and $R$ is any orthogonal matrix. In the limit $\sigma^2 \to 0$, pPCA recovers standard PCA exactly.

**Generating new samples.** Having learned $W, \mu, \sigma^2$, we generate new data via ancestral sampling:

$$z^* \sim \mathcal{N}(0, I_M) \xrightarrow{W, \mu} x^* \sim \mathcal{N}(\mu, C)$$

In practice, we draw $z^*$, compute $Wz^* + \mu$, and add Gaussian noise $\varepsilon \sim \mathcal{N}(0, \sigma^2 I_D)$. In the lecture, this was demonstrated on the MNIST1D dataset: with $M = 30$ components, $\sigma^2$ was small and samples were visually similar to real data. With fewer components, $\sigma^2$ was larger and samples were noisier.

### 16 How do non-linear latent variable models differ from linear ones? What are the advantages and disadvantages of including non-linearity in latent variable models?

**Linear models: the limits of pPCA.** In pPCA, the map from latent space to data space is linear: $x = Wz + \mu + \varepsilon$. This means the data manifold (the set of plausible data points) is a flat $M$-dimensional plane in the $D$-dimensional data space. For datasets that lie near a genuinely linear subspace (e.g. if data variation is dominated by a few independent linear factors), this works well and has the major advantage of an analytic ML solution for $W, \mu$, and $\sigma^2$.

Many real datasets, however, have intrinsic structure that is non-linear. Consider handwritten digits: the space of plausible "3"s is not a flat plane — rotations, size variations, and style variations create a curved manifold. PCA can only capture the dominant linear trends.

**Non-linear latent variable models.** The natural extension is to replace the linear map $Wz$ with a neural network decoder $f(z, \phi)$:

$$x \sim p(x | z, \phi) = \mathcal{N}(f(z, \phi), \sigma^2 I)$$

where:
- $f(z, \phi)$: decoder neural network with parameters $\phi$ (maps latent $z$ non-linearly to data space)

This is the VAE decoder. The problem is that the posterior $p(z | x) \propto p(x | z) p(z)$ is now intractable because the non-linear $f$ means we cannot marginalise analytically. This is why VAEs need the ELBO (Q17) and a second neural network (the encoder) to approximate the posterior.

**Advantages of non-linearity.**

- Can model curved, multi-modal, and topologically complex data manifolds that linear models simply cannot represent.

- The latent space can be significantly more compact for the same reconstruction quality (fewer dimensions $M$ needed).

- Generative quality (e.g. image synthesis, molecule generation) is far superior.

**Disadvantages.**

- The posterior $p(z | x)$ is intractable; it must be approximated via the ELBO (VAE) or MCMC.

- No closed-form solution; training is iterative, computationally expensive, and sensitive to hyperparameters.

- Latent space is less interpretable: individual dimensions may not correspond to human-interpretable factors of variation.

- Posterior collapse: during training the encoder may learn to ignore $z$ entirely, and the decoder learns the unconditional data mean. This is a known failure mode of VAEs that requires careful regularisation.

### 17 What is the evidence lower bound (ELBO) and why is it useful?

**The problem it solves.** Training a latent variable model requires maximising the log marginal likelihood (also called the evidence):

$$\log p(x | \phi) = \log \int p(x | z, \phi) p(z) \, dz$$

For linear models (pPCA), this integral is Gaussian and tractable. For non-linear decoders, it is not. We cannot evaluate, differentiate, or maximise this integral directly.

**Deriving the ELBO.** The trick is to introduce an auxiliary variational distribution $q(z, \theta)$ that approximates the true posterior, then use it to construct a tractable lower bound. Multiply and divide inside the log by $q$:

$$\log p(x | \phi) = \log \int q(z, \theta) \frac{p(x, z | \phi)}{q(z, \theta)} \, dz$$

Now apply Jensen's inequality: since log is concave, $\log \mathbb{E}[Y] \geq \mathbb{E}[\log Y]$:

$$\log p(x | \phi) \geq \int q(z, \theta) \log \frac{p(x, z | \phi)}{q(z, \theta)} \, dz =: \text{ELBO}(\theta, \phi)$$

where:
- $q(z, \theta)$: variational approximation to the posterior $p(z | x, \phi)$
- $\theta$: parameters of $q$ (e.g. mean and variance of a Gaussian)
- $\phi$: parameters of the generative model (e.g. decoder network weights)
- Jensen's inequality holds because log is concave: $\log \mathbb{E}[Y] \geq \mathbb{E}[\log Y]$

**Key identity.** The ELBO and the true log-likelihood differ by the KL divergence between $q$ and the true posterior:

$$\log p(x | \phi) = \text{ELBO}(\theta, \phi) + D_{\text{KL}}[q(z, \theta) \| p(z | x, \phi)]$$

where:
- $D_{\text{KL}}[q \| p] \geq 0$: Kullback–Leibler divergence; zero iff the two distributions are identical
- Since $D_{\text{KL}} \geq 0$: ELBO $\leq \log p(x)$ always (it is a lower bound on the evidence)

This means maximising the ELBO simultaneously (i) pushes up the log-likelihood (what we want) and (ii) minimises the KL divergence between $q$ and the true posterior (making the approximation better). Both objectives are aligned.

**An alternative decomposition.** The ELBO can be rewritten as:

$$\text{ELBO}(\theta, \phi) = \mathbb{E}_q[\log p(x, z | \phi)] + H[q(z, \theta)]$$

where:
- $\mathbb{E}_q[\cdot]$: expectation under the variational distribution (estimated by sampling $z_s \sim q$)
- $H[q] = -\mathbb{E}_q[\log q]$: entropy of $q$; analytic for Gaussians; penalises overly narrow/concentrated posteriors

The entropy term acts as a regulariser, preventing the variational approximation from collapsing to a delta function. This formulation is used in the VAE: the expected log joint is estimated by sampling from the encoder $q(z | x, \theta)$ and passing through the decoder, while the entropy is analytic (for Gaussian $q$, it equals $\theta_2 + \frac{1}{2}\log(2\pi e)$ where $\theta_2$ is the log-standard-deviation).

**Why it is useful.** Without the ELBO, non-linear latent variable models simply cannot be trained. It provides a tractable surrogate objective that (a) can be computed by sampling, (b) can be differentiated with respect to both $\theta$ and $\phi$ via the reparameterisation trick, and (c) unifies the EM algorithm (where $q$ is set to the exact posterior) with variational inference (where $q$ is an approximation from a parametric family).

### 18 What are the advantages and disadvantages of sampling-based approaches to Bayesian inference?

**The Bayesian inference problem.** We want the posterior distribution $p(z | x)$ over latent variables $z$ (which may include model parameters) given observed data $x$. By Bayes' rule:

$$p(z | x) = \frac{p(x | z) p(z)}{p(x)}, \quad p(x) = \int p(x | z) p(z) \, dz$$

The denominator $p(x)$ (the evidence) is intractable for non-conjugate models. Sampling-based approaches sidestep this by working only with the unnormalised quantity $h(z) = p(x | z) p(z) \propto p(z | x)$.

**Metropolis–Hastings.** The Metropolis algorithm constructs a Markov chain whose stationary distribution is $p(z | x)$:

1. Propose $z^* \sim T(z_n, z^*)$ (e.g. Gaussian random walk: $z^* = z_n + \sigma\xi$, $\xi \sim \mathcal{N}(0, I)$).

2. Accept with probability $\alpha = \min\left(1, \frac{h(z^*)}{h(z_n)}\right)$. Accept: $z_{n+1} = z^*$. Reject: $z_{n+1} = z_n$.

where:
- $T(z_n, z^*)$: symmetric proposal distribution (transition kernel)
- $h(z) = p(x | z) p(z)$: unnormalised posterior (the normalising constant $p(x)$ cancels in the acceptance ratio)
- $\alpha$: acceptance probability; if $z^*$ is more probable than $z_n$ we always accept; otherwise we accept with some probability, allowing occasional uphill moves to explore the space

**Advantages.**

- **Asymptotically exact.** Given enough samples and a valid proposal, the chain converges to the true posterior. Unlike variational inference, there is no approximation error at convergence.

- **Flexible.** Works with any prior/likelihood combination, including non-conjugate models, hierarchical models, and those with discrete latent variables.

- **Can capture multi-modal posteriors.** A sufficiently well-mixed chain will visit all modes; variational methods with Gaussian families may miss some.

**Disadvantages.**

- **Computationally expensive.** Each step requires evaluating $h(z)$, which means running the full forward model once. For expensive simulators, this is prohibitive.

- **Correlated samples.** Consecutive samples in the chain are not independent; the effective sample size (ESS) is much smaller than the chain length. ESS must be monitored.

- **Slow mixing.** In high dimensions or for ill-conditioned posteriors (e.g. the "Banana" function in the lecture), the Gaussian random walk proposal takes tiny steps and explores the space extremely slowly.

- **Burn-in required.** Early samples depend on the starting point and must be discarded.

**Hamiltonian Monte Carlo / NUTS.** HMC addresses the slow mixing problem by augmenting $z$ with a momentum variable $p$ and evolving Hamilton's equations of motion:

$$\dot{z} = M^{-1}p, \quad \dot{p} = -\nabla_z V(z), \quad V(z) = -\log h(z)$$

where:
- $p$: momentum variable (resampled fresh at each HMC step from $\mathcal{N}(0, M)$)
- $M$: mass matrix (preconditioning; often set to $I$)
- $V(z) = -\log h(z)$: potential energy
- $\nabla_z V(z)$: gradient of the potential, computed cheaply via autodiff

The gradient information allows the sampler to make large, directed moves along the posterior, dramatically improving ESS. The No-U-Turn Sampler (NUTS) automatically tunes the trajectory length and step size. In the lecture, NUTS (via numpyro) achieved an ESS of $\sim$1000 from 1000 samples on the Banana posterior, whereas vanilla Metropolis achieved an ESS of only $\sim$3.

### 19 Outline how the variational inference approach can be applied to a 1D inference problem with a normal prior and normal likelihood.

**The problem.** We have $N$ noisy measurements of an unknown scalar $g$ (e.g. gravitational acceleration at a location):

$$x_i = g + \varepsilon_i, \quad \varepsilon_i \sim \mathcal{N}(0, \sigma^2), \quad i = 1, \ldots, N$$

We have a prior belief $g \sim \mathcal{N}(g_0, s_0^2)$ and want the posterior $p(g | x)$. For this conjugate model the posterior is analytically Gaussian, so we can use this example to verify our variational approach.

where:
- $g$: scalar latent variable (true gravitational acceleration)
- $x_i$: $i$-th noisy measurement
- $\sigma^2$: known measurement noise variance
- $g_0, s_0^2$: prior mean and variance

**Step 1: Choose a variational family.** We approximate the posterior with a Gaussian: $q(g; \theta) = \mathcal{N}(g | \theta_1, e^{2\theta_2})$, with free parameters $\theta = [\theta_1, \theta_2]$.

where:
- $\theta_1$: variational mean
- $\theta_2$: log-standard-deviation (using $e^{2\theta_2}$ rather than $\theta_2$ directly keeps the variance positive during unconstrained optimisation)

For this 1D conjugate problem, the true posterior is also Gaussian, so this family is exact and we will recover the true posterior at convergence.

**Step 2: Write the ELBO.**

$$\text{ELBO}(\theta) = \mathbb{E}_q[\log p(g)] + \mathbb{E}_q\left[\sum_{i=1}^N \log p(x_i | g)\right] + H[q(g; \theta)]$$

For a Gaussian variational distribution, the entropy is analytic: $H[q] = \theta_2 + \frac{1}{2}\log(2\pi e)$, which depends only on the spread parameter $\theta_2$. The expected log-likelihood is estimated via Monte Carlo.

**Step 3: Sample approximation.** Draw $S$ samples $g_s \sim q(g; \theta)$ and estimate:

$$\text{ELBO}(\theta) \approx \frac{1}{S}\sum_{s=1}^S \left[\log p(g_s) + \sum_{i=1}^N \log p(x_i | g_s)\right] + \theta_2 + \text{const}$$

where:
- $S$: number of Monte Carlo samples used per ELBO estimate (typically 1–10 is sufficient)
- $g_s$: samples from the current variational distribution

**Step 4: Reparameterisation trick.** To compute gradients $\nabla_\theta \text{ELBO}$ via autodiff, we cannot differentiate through the sampling step $g_s \sim q$. The reparameterisation trick resolves this: write $g = \theta_1 + e^{\theta_2} \cdot \epsilon$, $\epsilon \sim \mathcal{N}(0, 1)$. Now $\theta$ enters deterministically, and the expectation is over $\epsilon$ (which does not depend on $\theta$). Gradients flow through.

**Step 5: Optimise.** Maximise the ELBO via Adam SGD:

$$\theta \leftarrow \theta + \eta \nabla_\theta \text{ELBO}(\theta)$$

In the lecture, the variational posterior (after convergence) matched the MCMC reference posterior closely, confirming that variational inference recovers the correct answer in this conjugate case.

**Advantages over MCMC:** optimisation converges far faster than sampling for large models (VAEs, Bayesian neural networks); scales gracefully with dataset size.

**Disadvantages:** restricting $q$ to a parametric family (e.g. Gaussian) introduces approximation error if the true posterior is non-Gaussian or multi-modal. Variational inference is biased; MCMC is not (asymptotically).

---

## Part B: Additional Questions for 15-Credit Students (Lectures 1–4)

### 20 How are the derivatives of a quantity of interest with respect to its input variables used in sensitivity analysis?

**The setting.** Suppose we have a computational model (e.g. an atomistic simulation code) that computes a quantity of interest $Q$ as a function of $p$ input parameters $x = (x_1, \ldots, x_p)$. These could be force-field parameters, material properties, or geometry variables. We want to understand which parameters most strongly influence $Q$, both to focus modelling effort and to quantify how uncertainty in the inputs propagates to uncertainty in the output.

**The Taylor expansion.** The key idea is to expand $Q(x)$ about a nominal point $\bar{x}$ (typically the mean or best-estimate value) using a Taylor series:

$$Q(x) = Q(\bar{x}) + \nabla Q^{\top} \Delta + \frac{1}{2}\Delta^{\top} \nabla^2 Q \Delta + O(\|\Delta\|^3)$$

where:
- $Q(x)$: quantity of interest (e.g. bulk modulus, vacancy formation energy)
- $\bar{x}$: nominal parameter values
- $\Delta = x - \bar{x}$: displacement from nominal
- $\nabla Q \in \mathbb{R}^p$: gradient (first-order sensitivities; each component tells you how much $Q$ changes per unit change in $x_i$)
- $\nabla^2 Q \in \mathbb{R}^{p \times p}$: Hessian (second-order sensitivities; captures curvature and parameter interactions)

**Computing the derivatives.** The first-order sensitivities are estimated by forward finite differences, requiring $p + 1$ evaluations of $Q$:

$$(\nabla Q)_i \approx \frac{Q(\bar{x} + h_i \hat{e}_i) - Q(\bar{x})}{h_i}$$

where:
- $h_i$: finite difference step (typically $h_i = 10^{-6}\bar{x}_i$)
- $\hat{e}_i$: unit vector in direction $i$

The diagonal second-order sensitivities require two extra evaluations per parameter, and the off-diagonal elements require four:

$$(\nabla^2 Q)_{ii} \approx \frac{Q(\bar{x} + h_i\hat{e}_i) - 2Q(\bar{x}) + Q(\bar{x} - h_i\hat{e}_i)}{h_i^2}$$

$$(\nabla^2 Q)_{ij} \approx \frac{Q(\bar{x} + h_i\hat{e}_i + h_j\hat{e}_j) - Q(\bar{x} + h_i\hat{e}_i - h_j\hat{e}_j) - Q(\bar{x} - h_i\hat{e}_i + h_j\hat{e}_j) + Q(\bar{x} - h_i\hat{e}_i - h_j\hat{e}_j)}{4h_i h_j}$$

where:
- $(\nabla^2 Q)_{ii}$: second derivative w.r.t. $x_i$ alone (diagonal Hessian; central difference formula)
- $(\nabla^2 Q)_{ij}$: mixed derivative (off-diagonal; captures how parameter interactions affect $Q$; symmetric so only the upper triangle is needed)

The second-order calculation requires $\sim 2p^2$ evaluations in total.

**How derivatives are used.** Once we have $\nabla Q$, we can compare parameters on a common scale using:

- **Scaled sensitivity coefficients (dimensionless):** $\bar{x}_i \frac{\partial Q}{\partial x_i}\big|_{\bar{x}}$.

- **Sensitivity indices (weighted by uncertainty):** $\sigma_i \frac{\partial Q}{\partial x_i}\big|_{\bar{x}}$, where $\sigma_i$ is the standard deviation of $x_i$.

The first-order variance estimation formula then propagates input uncertainty to output uncertainty:

$$\text{Var}(Q) \approx \nabla Q^{\top} \Sigma \nabla Q$$

where:
- $\Sigma$: $p \times p$ covariance matrix of input parameters (diagonal if inputs are independent: $\Sigma = \text{diag}(\sigma_1^2, \ldots, \sigma_p^2)$)

a result which follows directly from error propagation using the first-order Taylor expansion.

### 21 Why is sensitivity analysis useful for systems with a large number of input variables?

**The scaling problem.** First-order sensitivity analysis costs $p + 1$ forward model evaluations; for $p = 12$ Tersoff parameters this is 13 runs. For second-order analysis the cost scales as $\sim 2p^2$ — for $p = 100$ parameters that is 20,000 evaluations, which is prohibitive if each run takes minutes or hours. The key insight of sensitivity analysis is that we almost never need all $2p^2$ evaluations: in practice, only a small number $k \ll p$ of parameters strongly influence $Q$.

**Parameter screening.** Computing first-order sensitivities for all $p$ parameters at cost $p + 1$ lets us rank parameters by their impact on $Q$. In the bulk modulus example from the lecture, it was clear that $\lambda$ and $\mu$ dominated (because they appear in exponentials in the Tersoff potential), while $r_1$ and $r_2$ (cutoff distances) had essentially zero sensitivity index. This means we can safely fix the insensitive parameters at their nominal values and build surrogate models, do MCMC, or run optimisations in a reduced space of dimension $k$ rather than $p$.

**Sparse regression as a data-efficient alternative.** When even $p + 1$ evaluations is too expensive, we can use sparse regression to recover the active parameters from $I \ll p$ function evaluations. The first-order Taylor expansion can be rewritten as a linear system $X\beta = y$:

$$X_{ij} = \frac{x_{ij} - \bar{x}_j}{\bar{x}_j}, \quad y_i = Q(x_i) - Q(\bar{x}), \quad \beta_j = \bar{x}_j \frac{\partial Q}{\partial x_j}$$

where:
- $X_{ij}$: normalised displacement of parameter $j$ in sample $i$
- $y_i$: change in $Q$ from nominal for sample $i$
- $\beta_j$: scaled sensitivity coefficient for parameter $j$ (what we want to find)

Lasso regression enforces sparsity through an $\ell_1$ penalty:

$$\hat{\beta}_{\text{lasso}} = \arg\min_\beta \left[\frac{1}{2I}\sum_{i=1}^I (y_i - \beta \cdot x_i)^2 + \lambda\|\beta\|_1\right]$$

where:
- $\lambda > 0$: regularisation strength (chosen by cross-validation)
- $\|\beta\|_1 = \sum_j |\beta_j|$: $\ell_1$ norm; drives insensitive $\beta_j$ to exactly zero, identifying the active parameters

which automatically drives the insensitive $\beta_j$ to zero and identifies the $k$ active parameters from only $I \sim k$ samples — far fewer than $p + 1$. In the lecture, Lasso with $I = 30$ samples correctly identified the 5 most important of 100 parameters; ridge regression with the same data failed to do so.

### 22 What is the main advantage of linear regression over non-linear regression? How can non-linearity be introduced, e.g. to fit y = cos(x) from noisy observations?

**The convexity advantage.** The core advantage of linear regression is that the least-squares minimisation problem is convex: there is a single global minimum with a closed-form analytic solution. Given a design matrix $\Phi$ and target vector $y$:

$$w_{\text{LS}} = (\Phi^{\top}\Phi)^{-1}\Phi^{\top}y$$

where:
- $w_{\text{LS}}$: least-squares weight vector (unique global minimiser of $\|\Phi w - y\|^2$)
- $\Phi$: $n \times M$ design matrix with $\Phi_{ij} = \phi_j(x_i)$
- $y$: $n$-vector of observed outputs

In practice: compute the QR decomposition $\Phi = QR$ and solve $Rw = Q^{\top}y$ by back-substitution. This avoids forming $\Phi^{\top}\Phi$ explicitly, which would square the condition number and cause numerical instability. `numpy.linalg.lstsq` does this automatically.

By contrast, non-linear models such as neural networks have a non-convex loss with many local minima. Training requires iterative optimisation (SGD), is sensitive to initialisation and learning rate, and has no guarantee of finding the global minimum. For problems where a linear model is expressive enough, this extra complexity is unnecessary.

**Non-linearity through basis functions.** The clever observation that makes linear regression much more powerful than it first appears is that the inputs can be transformed non-linearly while the model remains linear in the parameters:

$$y(x; w) = \sum_{j=1}^M w_j \phi_j(x) = w^{\top}\phi(x)$$

where:
- $\phi_j(x)$: $j$-th basis function (can be any non-linear function of $x$)
- $w_j$: weight for basis function $j$ (the parameters to learn, which appear linearly)
- $M$: number of basis functions

This is the generalised linear model (GLM). The basis functions do the non-linear work; the least-squares problem in $w$ is still convex and has the same closed-form solution.

**Fitting y = cos(x) from noisy data.**

- **Fourier basis:** $\phi_1(x) = \cos(x)$, $\phi_2(x) = \sin(x)$. This is the ideal choice: $\cos(x)$ is exactly represented by $w_1 = 1, w_2 = 0$. Just two parameters suffice and the fit is exact (to machine precision) in the noise-free case.

- **Polynomial basis:** $\phi_j(x) = x^{j-1}$. The Taylor expansion $\cos x = 1 - x^2/2! + x^4/4! - \cdots$ shows that a polynomial can approximate $\cos(x)$ well locally, but needs increasing degree as the domain grows, and high-degree polynomials have conditioning problems.

- **Radial basis functions (RBFs):** $\phi_j(x) = \exp[-(x - x_j^c)^2 / 2\ell^2]$. With enough centres and a well-chosen lengthscale $\ell$, RBFs can approximate any smooth function — but require choosing $x_j^c$ and $\ell$.

### 23 How do you choose appropriate basis functions for use with linear regression?

**A sequential decision process.** Choosing basis functions is one of the most important modelling decisions in linear regression, and the right choice depends on domain knowledge, computational constraints, and the nature of the data.

**Use domain knowledge first.** If you know something about the structure of the target function, exploit it: periodic functions call for Fourier bases; functions with known localised features call for RBFs; polynomial trends call for polynomial bases. The Fourier example above (fitting $\cos(x)$) shows that the right basis reduces the problem to a trivial one-parameter fit.

**Smoothness and the lengthscale $\ell$ for RBFs.** RBFs $\phi_j(x) = \exp[-(x - x_j^c)^2 / 2\ell^2]$ have a lengthscale parameter $\ell$ that controls the smoothness of the represented function. A small $\ell$ gives narrow, localised bumps that can fit highly variable functions but tend to overfit; a large $\ell$ gives broad, smooth bumps that enforce smoothness but may have too high a bias. The optimal $\ell$ is problem-dependent and should be chosen by cross-validation or, better, by maximising the Bayesian evidence.

**Number of basis functions M.** Too few $\Rightarrow$ underfitting (the model cannot represent the true function). Too many $\Rightarrow$ overfitting (the model fits noise). The Bayesian framework gives a principled way to select $M$ by maximising the marginal likelihood (evidence):

$$\log p(y | \alpha, \beta) = \frac{M}{2}\log \alpha + \frac{N}{2}\log \beta - \frac{\beta}{2}\|y - \Phi m_N\|^2 - \frac{\alpha}{2}m_N^{\top}m_N - \frac{1}{2}\log |S_N^{-1}| - \frac{N}{2}\log 2\pi$$

where:
- $\alpha$: precision of the Gaussian weight prior ($\alpha = 1/\sigma_w^2$)
- $\beta$: noise precision ($\beta = 1/\sigma_n^2$)
- $m_N$: posterior mean of the weights
- $S_N$: posterior covariance of the weights
- $M$: number of basis functions
- $N$: number of data points

The first term rewards models with many basis functions; the data-fit term rewards accuracy; the remaining terms penalise complexity. The optimum $M$ automatically balances these.

**Numerical conditioning.** High-degree polynomial bases become badly conditioned (the columns of $\Phi$ become nearly linearly dependent), leading to numerical instability in the least-squares solve. Orthogonal bases (Fourier series, Chebyshev polynomials) avoid this: the columns of $\Phi$ are approximately orthogonal, making $\Phi^{\top}\Phi$ well-conditioned.

**Extrapolation.** RBFs decay to zero outside the training data range, so predictions naturally revert toward the mean and uncertainty increases gracefully. High-degree polynomial bases can diverge wildly outside the training domain. This is an important practical consideration when the model will be used for predictions in regions of input space not well-covered by the training data.

### 24 What are under- and over-fitting and how can they be avoided?

**The fundamental tension.** Every regression model must strike a balance: complex enough to capture the real patterns in the data, but not so complex that it learns the noise. This tension is at the heart of the bias–variance trade-off.

**Underfitting** occurs when the model is too simple. It has high bias: it systematically deviates from the true function regardless of how much data you have. The tell-tale sign is that both training and validation error are high. A linear fit to $y = \sin(x)$ is the canonical example: no matter how many data points you use, the linear model cannot approximate a sinusoid.

**Overfitting** occurs when the model is too complex. It has high variance: it fits the training data (including noise) very well, but the fitted function is highly sensitive to the specific training set and generalises poorly. The tell-tale sign is a large gap between training and validation error (training error low; validation error high). A degree-15 polynomial fitted to 10 noisy data points will typically pass through or near all 10 points but oscillate wildly between them.

**Detecting over- and under-fitting.** The standard diagnostic is to hold out a validation set that is never used during fitting. Plot training error and validation error as a function of model complexity (e.g. polynomial degree, number of basis functions $M$, regularisation strength $\lambda$). The U-shaped validation curve reveals the bias–variance trade-off: at low complexity, both errors are high (underfitting); at high complexity, training error is low but validation error rises (overfitting); the optimal complexity minimises validation error.

**How to avoid each problem.**

- **Underfitting:** use richer basis functions or a more expressive model (higher $M$, deeper/wider network). Add polynomial or interaction terms.

- **Overfitting:** collect more data (most effective remedy); add explicit regularisation ($L_2$ adds $\lambda\|w\|_2^2$, $L_1$ adds $\lambda\|w\|_1$); reduce model complexity by decreasing $M$; use cross-validation to select hyperparameters; use early stopping in iterative training; use Bayesian model selection (maximise marginal likelihood over $M$ and $\lambda$ simultaneously).

### 25 What is a surrogate model and why is it useful? Give examples of possible approaches.

**The motivation.** Many scientific computing tasks require evaluating an expensive simulation code many times. The Tersoff bulk modulus calculation in the lecture takes a fraction of a second, but a density functional theory (DFT) calculation of the same quantity could take hours on a cluster. Tasks such as uncertainty propagation (sample the output distribution), global optimisation (find the parameter set that minimises the QoI), or MCMC inference (explore the posterior) may require $10^4$–$10^6$ evaluations — clearly infeasible with the expensive code directly.

A surrogate model (or emulator) is an inexpensive mathematical model $\hat{Q}(x) \approx Q(x)$ that is trained on $N$ runs of the expensive code and can subsequently be evaluated in microseconds. Once the surrogate is built, downstream tasks (optimisation, MCMC, uncertainty propagation) are run against the surrogate, not the expensive code.

**What makes a good surrogate.** A surrogate should: (1) accurately reproduce the code outputs at the training points; (2) interpolate well between them; (3) provide calibrated uncertainty estimates so we know when the surrogate is being asked to extrapolate.

**Example approaches.**

- **Gaussian Process Regression (GPR):** the gold standard for expensive codes in low-to-moderate dimensions ($p \lesssim 20$). GPR is non-parametric, provides analytical posterior mean and variance, and can be optimised by maximising the marginal likelihood to automatically select kernel hyperparameters. In the lecture, a Matérn-3/2 GP was built for the Tersoff vacancy energy using 25 Latin-hypercube samples and achieved a test MAE of 0.04 eV. Training is $O(N^3)$; prediction is $O(N)$.

- **Polynomial chaos / linear regression with RBFs:** explicit basis function expansion; fast and interpretable; best for smooth, low-variance responses.

- **Neural networks:** highly flexible; can handle very high-dimensional inputs; require significantly more training data (typically $N \gg 100$). Better for high-dimensional inputs than GPs.

- **Bayesian optimisation:** rather than building a static surrogate, Bayesian optimisation uses a GP surrogate that is updated sequentially. At each step, an acquisition function (e.g. Expected Improvement) determines the most informative next point to evaluate. This allows finding the global optimum of an expensive function with the minimum number of evaluations.

### 26 What do you need to consider when training a Gaussian process?

**Overview.** Training a GP is more subtle than training a neural network: there are no "weights" to learn by gradient descent. Instead, we choose a kernel function that encodes assumptions about the function, and optimise a set of hyperparameters by maximising the marginal likelihood. Each design choice has important consequences.

**1. Kernel selection.** The kernel $k(x, x')$ encodes our prior belief about the smoothness, periodicity, and scale of the function. It is the most important design choice.

- **The Squared Exponential (RBF)** $k(x, x') = v \exp[-\frac{1}{2}\sum_i (x_i - x'_i)^2 / \ell_i^2]$ is infinitely differentiable. It is a popular default but is often too smooth for real physical data (Matérn kernels are usually better).

- **The Matérn kernel** with $\nu = 3/2$ or $5/2$ is differentiable exactly $\nu$ times. It is generally a better default for real-world data because physical quantities rarely have infinite smoothness.

- **Kernels can be composed:** sum $k_\oplus = k_1 + k_2$ models additive structure; product $k_\otimes = k_1 \cdot k_2$ models multiplicative interactions.

where:
- $v > 0$: signal variance (controls the amplitude of function variations)
- $\ell_i > 0$: lengthscale along input dimension $i$ (larger $\ell$ = smoother variations along that axis)

**2. Hyperparameter optimisation.** Hyperparameters $\psi = \{v, \ell_1, \ldots, \ell_p, \sigma_n^2\}$ should not be set by hand; they should be optimised by maximising the log marginal likelihood:

$$\log p(y | X, \psi) = -\frac{1}{2}y^{\top}(K + \sigma_n^2 I)^{-1}y - \frac{1}{2}\log |K + \sigma_n^2 I| - \frac{N}{2}\log 2\pi$$

where:
- $y$: $N$-vector of training observations
- $X$: $N \times p$ matrix of training inputs
- $K$: $N \times N$ kernel matrix, $K_{ij} = k(x_i, x_j)$
- $\sigma_n^2$: observation noise variance
- $(K + \sigma_n^2 I)^{-1}$: computed via Cholesky decomposition ($O(N^3)$) for numerical stability

The data fit term $-\frac{1}{2}y^{\top}(K + \sigma_n^2 I)^{-1}y$ rewards accurate predictions; the log-determinant term $-\frac{1}{2}\log |K + \sigma_n^2 I|$ penalises overly complex kernels (model complexity penalty). Their balance automatically selects the right kernel complexity.

The marginal likelihood is non-convex in hyperparameter space, so multiple random restarts are essential to avoid local minima — this was demonstrated concretely in the lecture, where different restarts found different local minima.

**3. Practical tips.**

- Standardise inputs to $[0, 1]$ and targets to zero-mean/unit-variance before fitting. Then initialise lengthscales to $\sim 1$ (comparable to the input scale) and signal variance to $\sim 1$.

- Initialise the noise variance high even if you believe the data has low noise. Starting with low noise can trap the optimiser in a poor local minimum; high initial noise lets it explore the hyperparameter space more freely.

- Always use multiple restarts (5–10 is usually sufficient) and take the run with the highest marginal likelihood.

**4. Computational cost.** Training requires computing the Cholesky decomposition of the $N \times N$ matrix $K + \sigma_n^2 I$, which costs $O(N^3)$ in time and $O(N^2)$ in memory. For large $N$ (e.g. $N > 10,000$), this becomes prohibitive. Sparse GP approximations (selecting $M \ll N$ inducing points that summarise the training data) reduce the cost to $O(NM^2)$ at the cost of some approximation error.

**5. Beware extrapolation.** This is perhaps the most important practical warning. GP uncertainty estimates are well-calibrated within the training data's convex hull. Outside it, the posterior mean reverts to the prior mean (usually zero) and the variance reverts to the signal variance — regardless of what the true function is actually doing. The lecture demonstrated this clearly: the GP vacancy energy surrogate gave accurate error bars within the training range of $\lambda$, but when extrapolated further the relaxation failed to converge and the true function behaved completely differently. The kernel encodes smoothness, not physics.
