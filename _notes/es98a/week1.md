---
layout: page
title: "Week 1: From measurements to models"
---

A material is stretched twice. At strain $\varepsilon_1=1$ it produces stress $\sigma_1=2$; at strain $\varepsilon_2=2$ it produces stress $\sigma_2=3$. These are illustrative values in rescaled units, not experimental data.

If stress is proportional to strain, the first measurement suggests a stiffness of $2$, while the second suggests $1.5$. Which should we use to predict a third measurement?

The difficulty is not that we lack a formula. We have one. The difficulty is deciding how a formula should meet imperfect observations. This question leads us from fitting a single number to the geometry of vectors, projections and matrices. Later in the module, the unknown will be an entire function; the geometry developed here will still be useful.

**In this week:** [models and misfit](#models), [linear parameters](#features), [inner products and coordinates](#coordinates), [outer products](#outer-products), [least squares](#least-squares), [adjoints and eigenvectors](#spectral), [positive matrices and factorisations](#positive).

<h2 id="models">1. What does it mean to learn a model?</h2>

### A physical law and a disagreement

Within the linear elastic regime, Hooke's law is

$$
\sigma=E\varepsilon.
$$

Here $\sigma$ is stress (force per cross-sectional area), $\varepsilon$ is strain (relative extension), and $E$ is Young's modulus. The law predicts stress from strain once $E$ is known. Learning $E$ from measurements runs the calculation in the opposite direction.

First hold the stiffness fixed at $E=2$. What must happen to the predicted stress when we double the strain? Follow the same change in the material and on the graph.

<HookeExperiment />

The line makes a strong commitment: once we choose its slope, we have chosen the stress at **every** strain. This is why two observations can disagree with a one-parameter model.

For our two observations, choosing $E$ predicts the pair $(E,2E)$. Whatever value we choose, the second predicted stress must be twice the first. The observed pair $(2,3)$ does not have that property. No parameter makes both equations exactly true.

We therefore need to say what counts as a good compromise. Suppose we penalise the two squared discrepancies equally:

$$
\Phi(E)=(2-E)^2+(3-2E)^2.
$$

Before differentiating, consider the tempting choice of averaging the two individually inferred stiffnesses.

<PredictReveal question="Does averaging the two inferred stiffnesses, giving E = 1.75, minimise this sum of squared stress errors?" choices={[{id: "yes", label: "Yes: the measurements receive equal weight"}, {id: "no", label: "No: changing E affects the two predicted stresses differently"}]} answer="no" explanation={<p>The minimiser is E = 1.6. A change of E moves the second prediction twice as far as the first, so equal weights on stress errors do not mean equal weights on the two inferred stiffnesses. We derive this below and return to its geometric meaning later.</p>} />

Expanding makes the distinction precise:

$$
\Phi(E)=5E^2-16E+13
       =5\left(E-\frac85\right)^2+\frac15.
$$

Thus $E^{\mathrm{opt}}=8/5=1.6$ is the unique minimiser and the remaining squared misfit is $1/5$. For a third strain $\varepsilon=3$, the fitted model predicts stress $4.8$.

But neither a small misfit nor a unique optimum tells us how reliable that prediction is. Perhaps the instrument is noisy; perhaps the material is no longer in its linear regime. Choosing a loss function is also a modelling decision: equal squared errors are not automatically appropriate when observations have different precisions.

### From this example to predictive modelling

Predictive modelling combines data with a principles-driven model, often through scientific computation, to predict behaviour **and assess uncertainty**. This module uses algebraic models and ODEs; PDEs and agent-based models extend the same questions.

Write the model as $\mathcal M(x;\theta)$, with input $x$ and parameters $\theta$. In an idealised exact model,

$$
y=\mathcal M(x;\theta^*).
$$

In practice we write $y\approx\mathcal M(x;\theta)$ because parameters, observations and even the model's functional form may be imperfect. For input–output pairs $(x_j,y_j)_{j=1}^J$, one possible calibration criterion is the **misfit**

$$
\Phi(\theta)=\sum_{j=1}^J |y_j-\mathcal M(x_j;\theta)|^2.
$$

The scalar example has already separated three questions: how to find a minimiser, whether it is unique, and whether the resulting prediction is trustworthy. These are different questions, and the course will develop different tools for them.

**Forward uncertainty quantification** asks how uncertainty in inputs or parameters affects model outputs. **Inverse problems**, also called inference, learning or backward UQ in this setting, ask what observations tell us about unknown parameters and their uncertainty. Optimisation supplies fitted values; probability will let us describe uncertainty; function spaces will let the unknown itself be a function.

<h2 id="features">2. A curved model can still be linear in its parameters</h2>

Why start with linear algebra if the world is not linear? Because a model can depend nonlinearly on its input while depending linearly on the quantities we are trying to learn.

Choose fixed feature functions $f_1,\ldots,f_n$ and write

$$
\mathcal M(x;\theta)=\sum_{k=1}^n \theta_k f_k(x).
$$

For example, $f_1(x)=1$, $f_2(x)=x$ and $f_3(x)=x^2$ produce a quadratic curve. Adding two coefficient vectors adds their predicted curves, even though adding two inputs generally does not add their outputs.

<ModelFamilyExplorer />

Switch from the straight line to the quadratic and then to the Fourier example. The shapes change, but the solid curve remains the sum of the two patterned curves at each input. The addition rule is about **coefficients**, not about the shape of a graph. In symbols,

$$
\mathcal M(x;\theta+\widetilde\theta)
=\mathcal M(x;\theta)+\mathcal M(x;\widetilde\theta),
$$

$$
\mathcal M(x+\widetilde x;\theta)
\ne \mathcal M(x;\theta)+\mathcal M(\widetilde x;\theta)
\quad\text{in general}.
$$

At the observed inputs, collect feature values into $A_{jk}=f_k(x_j)$. All predicted observations are then the vector $A\theta$. Our Hooke example is the special case with one column, $A=(1,2)^T$.

A nonlinear feature can also change the geometry of a classification problem. An inner disk and an outer ring cannot be separated by a straight line in the input plane. Lift each point to a height equal to its squared radius, then look for a flat separating plane. This is an illustration of feature geometry, not an additional assumption in our regression model.

<ES98AAnimation kind="feature-lift" />

A Fourier model makes the same point:

$$
\mathcal M(x;\theta)=\sum_k\theta_k e^{ikx},
\qquad
\theta=(\ldots,\theta_{-1},\theta_0,\theta_1,\ldots).
$$

For now, take a finite sum. Infinite Fourier expansions require convergence and a suitable coefficient space; those questions become central in Week 5.

<Sidenote>The original notes call these “generalised linear models”. Here we say “linear in the parameters” to avoid confusion with statistical GLMs, which additionally specify a response distribution and a link function.</Sidenote>

The fitting problem is now geometric: which point in the set of model predictions is closest to the observed data vector? To answer, we need a way to measure distance and resolve a vector into directions.

<h2 id="coordinates">3. Coordinates change; the vector does not</h2>

Imagine measuring a displacement using two perpendicular rulers. Rotating the rulers changes both readings, but not the displacement. The readings are coordinates; the underlying vector is the object they describe.

In the figure, the vector is fixed at $x=(2,1)$. Rotate the first ruler towards the vector. Before revealing the second component, predict what has happened to the part the first ruler misses.

<ProjectionExplorer />

When the first direction aligns with $x$, its projection recovers the whole vector. When it is perpendicular to $x$, that projection is zero. At intermediate angles, the missing part lies along the second ruler. The two pieces always reconstruct the same vector. This is the geometric content we now formalise.

### Inner product, norm and orthogonality

Let $\mathbb K$ be $\mathbb R$ or $\mathbb C$. In $\mathbb R^n$, the Euclidean dot product and norm are

$$
x\cdot y=\sum_{j=1}^n x_jy_j,
\qquad |x|=\sqrt{x\cdot x}.
$$

For complex vectors we use

$$
\langle x,y\rangle=\sum_{j=1}^n\overline{x_j}y_j,
\qquad |x|=\sqrt{\langle x,x\rangle}.
$$

Conjugation matters: without it, a nonzero complex vector could have a zero or non-real “squared length”. Our convention is conjugate-linear in the first argument and linear in the second.

Vectors are **orthogonal** when $\langle x,y\rangle=0$. A collection is **orthonormal** when its vectors have unit norm and distinct vectors are orthogonal. For real vectors, $\langle \psi,x\rangle$ with $|\psi|=1$ is the signed length measured along $\psi$.

### Reconstruction theorem and Parseval's identity

A basis $\psi_1,\ldots,\psi_n$ gives a unique expansion $x=\sum_j\alpha_j\psi_j$. An orthonormal basis makes its coefficients directly measurable:

$$
\alpha_j=\langle\psi_j,x\rangle,
\qquad
x=\sum_{j=1}^n\langle\psi_j,x\rangle\psi_j.
$$

**Proof.** Take the inner product of the expansion with $\psi_i$. Linearity in the second argument and $\langle\psi_i,\psi_j\rangle=\delta_{ij}$ give

$$
\langle\psi_i,x\rangle
=\sum_j\alpha_j\langle\psi_i,\psi_j\rangle=\alpha_i.
$$

The same orthogonality eliminates all cross terms in the squared norm:

$$
|x|^2
=\left\langle\sum_i\alpha_i\psi_i,\sum_j\alpha_j\psi_j\right\rangle
=\sum_{i,j}\overline{\alpha_i}\alpha_j\delta_{ij}
=\sum_j|\alpha_j|^2.
$$

This is **Parseval's identity**. In the experiment it says $\alpha_1^2+\alpha_2^2=5$ at every angle. A change of orthonormal coordinates redistributes squared length without creating or destroying it. In Week 5 the finite sum becomes a convergent series; in Week 7 the same identity accounts for the variance of random functions.

We can make the conserved quantity visible as area. Compare the original rulers with a $45^\circ$ rotation: the individual squares change, but their combined area does not.

<ParsevalDiagram />

<h2 id="outer-products">4. Turn a measurement into an operator</h2>

The [coordinate experiment](#projection-experiment) performs two operations: measure $\langle\psi_1,x\rangle$, then place that amount along $\psi_1$. We can package this as a linear map. More generally, the measuring direction and the output direction need not be the same.

**Definition (course outer-product convention).** For $a\in\mathbb K^m$ and $b\in\mathbb K^n$, define $a\otimes b:\mathbb K^m\to\mathbb K^n$ by

$$
(a\otimes b)x=\langle a,x\rangle b,
\qquad
(a\otimes b)_{ij}=b_i\overline{a_j}.
$$

Its matrix is $ba^*$. Its range lies in the line spanned by $b$, so it has rank at most one, and rank exactly one when both vectors are nonzero. The order of the two vectors is worth remembering: **first measure, then reconstruct**.

For $a=(1,0)$ and $b=(0,2)$,

$$
a\otimes b=\begin{pmatrix}0&0\\2&0\end{pmatrix}.
$$

It reads the first input coordinate and outputs twice that value in the second direction.

Follow an input $x=(2,1)$ through these two operations. Notice the bottleneck in the middle: once we have kept just one number, the second input coordinate cannot affect the output.

<OuterProductDiagram />

If $|u|=1$, the special case $P=u\otimes u$ is the orthogonal projection onto $\operatorname{span}\{u\}$:

$$
Px=\langle u,x\rangle u,\qquad P^2=P.
$$

The residual is perpendicular to that line, since $\langle u,x-Px\rangle=\langle u,x\rangle-\langle u,x\rangle=0$. This is precisely the dashed segment in the [rotating-rulers experiment](#projection-experiment). Unlike the outer-product example above, a projection uses the same unit direction to measure and reconstruct.

Reconstructing from every direction in an ONB gives an operator identity:

$$
x=\sum_j(\psi_j\otimes\psi_j)x,
\qquad
I=\sum_j\psi_j\otimes\psi_j.
$$

A complicated map can sometimes be understood by decomposing it into simple “measure then reconstruct” pieces. That will be the central idea of Week 2's SVD.

<h2 id="least-squares">5. Return to the measurements: fitting is projection</h2>

Our data vector is $y=(2,3)$, while a parameter $E$ produces $Ea$ with $a=(1,2)$. The allowed predictions form a line through the origin. Notice that this line lives in **observation space**: its two coordinates represent two different experiments.

The next figure uses the fitted $E=1.6$ from the opening calculation. On the left, we see two vertical errors in a stress–strain graph. On the right, those same errors become the two coordinates of one vector. This change of viewpoint is the step that turns curve fitting into projection.

<LeastSquaresDiagram />

Now let the stiffness move continuously towards the optimum. Follow the prediction in observation space and the loss at the same time. Which geometric event coincides with the bottom of the loss curve?

<ES98AAnimation kind="projection-fit" />

To explore this view, return to the [coordinate experiment](#projection-experiment) and select **Calibration preset**. It places the first ruler along $(1,2)$ and changes the observed vector to $(2,3)$. The perpendicular residual suggests a reason the algebraic optimum is optimal.

Which point on the line is closest to $y$? Decompose $y=p+r$, where $p$ lies on the line and $r$ is perpendicular to it. For any other point $z$ on the line, $p-z$ is perpendicular to $r$, so

$$
|y-z|^2=|r+(p-z)|^2=|r|^2+|p-z|^2\ge |r|^2.
$$

Equality occurs only at $z=p$. The closest point is therefore the orthogonal projection. Normalising $a$ gives

$$
p=\frac{\langle a,y\rangle}{|a|^2}a
=\frac85(1,2)=(1.6,3.2).
$$

Thus $E^{\mathrm{opt}}=8/5$, exactly as before, and $r=(0.4,-0.2)$ satisfies $a\cdot r=0$. The irreducible squared residual is $|r|^2=0.2$. The algebraic minimum and the geometric projection are two descriptions of the same result.

### Exact systems and least squares

For a square matrix $A\in\mathbb K^{n\times n}$, the system $Ax=b$ has the unique solution $A^{-1}b$ if $A$ is invertible. Numerical algorithms such as Gaussian elimination, conjugate gradients (under appropriate assumptions) and GMRES usually solve the system without explicitly constructing the inverse.

For a rectangular $A\in\mathbb K^{m\times n}$, the observation $b$ may not belong to the range of $A$. **Least squares** asks instead for

$$
\min_{x\in\mathbb K^n}|Ax-b|^2
=\min_x\sum_{j=1}^m|(Ax)_j-b_j|^2.
$$

The optimal predicted vector is the projection of $b$ onto the range. Different parameters can produce that same prediction if $A$ has a nontrivial kernel. Existence of a best prediction and uniqueness of its parameters are therefore separate issues.

Week 2 turns the perpendicular-residual condition into the normal equations $A^*(Ax-b)=0$. Before that expression can be useful, we should understand the adjoint and the directions in which a matrix acts simply.

<h2 id="spectral">6. Which directions make a matrix easy to understand?</h2>

### The adjoint transfers a measurement

Suppose $A$ maps an input $x$ into an output space. Measuring the output against $y$ gives $\langle Ax,y\rangle$. Can we obtain the same number by measuring the input instead?

The **adjoint** $A^*$ is defined by

$$
\langle Ax,y\rangle=\langle x,A^*y\rangle.
$$

For matrices, $A^*=\overline A^{\,T}$: $(A^*)_{ij}=\overline{A_{ji}}$. The ordinary transpose is $(A^T)_{ij}=A_{ji}$. Over the real numbers the two agree.

Here is a concrete way to read the identity. Take the shear $A=\begin{pmatrix}1&1\\0&1\end{pmatrix}$. We can move the input forwards through $A$ and then measure, or move the measuring vector backwards through $A^*$ and measure the original input. Compare the two dot products, rather than expecting the two pictures to have the same lengths or angles.

<AdjointDiagram />

The identity follows by expanding the sums, and it explains why adjoints appear in fitting: they move a condition on a residual in observation space back into parameter space.

### Eigenvectors and the Hermitian spectral theorem

Most directions are turned as well as stretched by a matrix. An **eigenvector** identifies an exception:

$$
Av=\lambda v,\qquad |v|=1.
$$

For real $\lambda$ the output stays on the same line; a negative eigenvalue reverses its direction. In general eigenvalues and eigenvectors may be complex, even for a real matrix.

A square matrix is **Hermitian** or **self-adjoint** if $A=A^*$. Such matrices admit a particularly complete directional description.

**Spectral theorem.** A Hermitian $A\in\mathbb K^{n\times n}$ has an orthonormal eigenbasis $v_1,\ldots,v_n$ and real eigenvalues $\lambda_1,\ldots,\lambda_n$. With $V=[v_1\ \cdots\ v_n]$ and $\Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_n)$,

$$
V^*V=I,\qquad A=V\Lambda V^*
=\sum_j\lambda_j(v_j\otimes v_j).
$$

The full existence theorem is stated here without proof. Once the basis exists, the representation follows from reconstruction: expand $x$ in the $v_j$, then apply $A$ to each component. Reality of each eigenvalue follows from self-adjointness, because $\langle v,Av\rangle=\langle Av,v\rangle$ implies $\lambda=\overline\lambda$ for a unit eigenvector.

For example,

$$
A=\begin{pmatrix}2&1\\1&2\end{pmatrix}
$$

has $v_1=(1,1)/\sqrt2$ with eigenvalue $3$, and $v_2=(1,-1)/\sqrt2$ with eigenvalue $1$. In these rotated coordinates the map simply multiplies one component by three and leaves the other alone. The familiar coordinate experiment now describes an operator, not only a vector.

<h2 id="positive">7. Positive matrices: squared lengths in transformed coordinates</h2>

A scalar square is nonnegative. What is the corresponding idea for a matrix? Test the matrix in every direction.

**Definition.** A Hermitian matrix $A$ is **self-adjoint positive semidefinite (SPSD)** if

$$
\langle Ax,x\rangle\ge0\quad\text{for all }x.
$$

It is **self-adjoint positive definite (SPD)** if the inequality is strict for every nonzero $x$.

There are two separate requirements here. **Self-adjoint** says $A=A^*$; **positive semidefinite** says that the scalar test $\langle Ax,x\rangle$ never becomes negative. It does not mean that every entry of $A$ is positive. And “semi” allows a nonzero vector to have zero value in this test.

To see the distinction, sweep a unit direction around the plane. For diagonal matrices, changing just the second diagonal entry lets us compare a positive direction, a flat direction and a negative direction without changing the axes or the test.

<PositivityDiagram />

Why is it enough to test unit vectors? Multiplying $x$ by a nonzero scalar multiplies $\langle Ax,x\rangle$ by its squared modulus, so it cannot change the sign. The plots suggest that the diagonal entries control the answer. The spectral theorem makes this reasoning available for **every** Hermitian matrix, by finding coordinates in which it is diagonal.

In an orthonormal eigenbasis,

$$
\langle Ax,x\rangle=\sum_j\lambda_j|\langle v_j,x\rangle|^2.
$$

Consequently, a Hermitian matrix is SPSD exactly when every eigenvalue is nonnegative, and SPD exactly when every eigenvalue is positive. Necessity follows by choosing $x=v_j$; sufficiency follows from the sum above. A zero eigenvalue is a direction that contributes no squared size.

### Gram matrices

For any rectangular matrix $B$, both $B^*B$ and $BB^*$ are SPSD. They are self-adjoint, and the adjoint identity gives

$$
\langle B^*Bx,x\rangle=|Bx|^2\ge0,
\qquad
\langle BB^*y,y\rangle=|B^*y|^2\ge0.
$$

Moreover, $B^*B$ is SPD exactly when $B$ has trivial kernel. This will explain the uniqueness condition in Week 2's least-squares equations. Later, covariance matrices will encode nonnegative variances in every direction using the same positivity structure.

### Matrix square roots

For a nonnegative scalar, taking a square root halves the exponent. For an SPSD matrix, do this in its eigenbasis:

$$
A^{1/2}=V\operatorname{diag}(\sqrt{\lambda_1},\ldots,\sqrt{\lambda_n})V^*.
$$

**Theorem.** Every SPSD matrix $A$ has a unique SPSD square root $B=A^{1/2}$ satisfying $B^2=A$.

**Existence** follows immediately by multiplying the displayed spectral representation. For **uniqueness**, any SPSD $B$ with $B^2=A$ commutes with $A$ and preserves each eigenspace of $A$. On its $\lambda$-eigenspace, the nonnegative eigenvalues of $B$ must square to $\lambda$, so $B$ equals $\sqrt\lambda I$ there.

The SPSD qualification is essential: other square roots need not be positive. For the preceding example, the principal square root is

$$
A^{1/2}=\frac12
\begin{pmatrix}\sqrt3+1&\sqrt3-1\\\sqrt3-1&\sqrt3+1\end{pmatrix}.
$$

### Cholesky factorisation

For computation, a triangular factor is often more convenient than a symmetric one.

**Theorem (SPD Cholesky).** If $A$ is SPD, there is a unique lower-triangular $L$ with positive real diagonal such that

$$
A=LL^*.
$$

Equivalently, $R=L^*$ is upper triangular and $A=R^*R$. For our example,

$$
L=\begin{pmatrix}\sqrt2&0\\1/\sqrt2&\sqrt{3/2}\end{pmatrix},
\qquad LL^*=\begin{pmatrix}2&1\\1&2\end{pmatrix}.
$$

This is a factorisation, not the principal matrix square root: in general $L^2\ne A$.

Follow the edges of a unit square to see the order of operations. In $LL^*x$, the upper-triangular factor $L^*$ acts first, then the lower-triangular factor $L$. Their combined action must match the columns of $A$.

<CholeskyDiagram />

The pairing also explains positivity: $\langle LL^*x,x\rangle=|L^*x|^2$. Because the diagonal of $L$ is positive, $L^*$ is invertible, so this squared length is strictly positive for nonzero $x$. The principal square root gives another such pairing, but with the same self-adjoint factor used twice.

For an SPSD matrix a triangular factor with nonnegative diagonal exists, but uniqueness can fail. For instance, every real matrix

$$
L=\begin{pmatrix}0&0\\a&b\end{pmatrix},
\qquad a^2+b^2=1,\quad b\ge0,
$$

satisfies $LL^*=\operatorname{diag}(0,1)$. The original notes asserted uniqueness for all SPSD matrices and paired a lower-triangular factor with the opposite product convention; the statement above corrects those qualifications.

### Exercises and the next question

1. Prove directly from its action that $u\otimes u$ is self-adjoint and idempotent for $|u|=1$. What changes if $u$ is not normalised?
2. Show that $B^*B$ is SPD exactly when $B$ is injective, and formulate the corresponding condition for $BB^*$.
3. Verify the two factorisations of the example matrix by multiplication. Explain why its principal square root is unique but unrestricted square roots need not be.
4. In the calibration example, perturb the second stress measurement by $\delta$. Show that the fitted stiffness changes by $2\delta/5$. What if both strain measurements were much smaller?

We began with two inconsistent observations. Distance made the disagreement measurable; projection identified the best prediction; bases and outer products explained how to measure and reconstruct it; spectral factorisation described how different directions can be scaled.

A general forward map need not be square or Hermitian. It can map between different spaces, and recovering a weakly measured direction can amplify noise. [Week 2](/notes/es98a/week2) develops the SVD to separate those input and output directions.
