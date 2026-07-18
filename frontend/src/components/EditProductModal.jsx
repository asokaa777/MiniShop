import { useEffect, useState } from "react";
import api from "../services/api";

function EditProductModal({ product, fetchProducts }) {

  const [form, setForm] = useState({});


  useEffect(() => {

    if(product){
      setForm(product);
    }

  }, [product]);


  const handleChange = (e)=>{

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  const updateProduct = ()=>{


    api
    .put(`/products/${product.id}`, form)

    .then(()=>{

      fetchProducts();


      document
      .querySelector("#editProductModal .btn-close")
      .click();


    })

    .catch(err=>{
      console.log(err);
    });


  };


  if(!product){
    return null;
  }


  return (

<div
className="modal fade"
id="editProductModal"
>

<div className="modal-dialog">

<div className="modal-content">


<div className="modal-header">

<h5>
Edit Produk
</h5>


<button
className="btn-close"
data-bs-dismiss="modal"
></button>

</div>



<div className="modal-body">


<input
className="form-control mb-2"
name="name"
value={form.name || ""}
onChange={handleChange}
/>


<input
className="form-control mb-2"
name="price"
value={form.price || ""}
onChange={handleChange}
/>


<textarea
className="form-control mb-2"
name="description"
value={form.description || ""}
onChange={handleChange}
/>



<input
className="form-control mb-2"
name="image"
value={form.image || ""}
onChange={handleChange}
/>



<input
className="form-control mb-2"
name="category"
value={form.category || ""}
onChange={handleChange}
/>



<input
className="form-control mb-2"
name="stock"
value={form.stock || ""}
onChange={handleChange}
/>



</div>


<div className="modal-footer">


<button
className="btn btn-secondary"
data-bs-dismiss="modal"
>
Tutup
</button>


<button
className="btn btn-warning"
onClick={updateProduct}
>
Update
</button>


</div>


</div>

</div>

</div>

  );

}

export default EditProductModal;