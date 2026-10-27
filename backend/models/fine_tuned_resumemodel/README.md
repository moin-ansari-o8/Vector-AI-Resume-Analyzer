---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- dense
- generated_from_trainer
- dataset_size:241
- loss:MultipleNegativesRankingLoss
base_model: sentence-transformers/all-MiniLM-L6-v2
widget:
- source_sentence: 'Domain: Apparel (Entry-level). Education: AA in Guidance, Broward
    College 2018; HS Diploma, Northeast HS 2015; NHS, varsity captain, class officer..
    Skills: Cash handling, POS, fashion advising, merchandising, conflict resolution,
    bilingual, multitasking.. Experience: Cashier 2011–current; apparel, grocery,
    and front desk; sales, displays, stock, training, promotions.'
  sentences:
  - 'Job Title: Sales Associate. Category: Retail & Hospitality. Experience Required:
    0 years. Education: High School. Required Skills: Sales, Customer Service, Product
    Knowledge, Communication, Problem Solving, Teamwork'
  - 'Job Title: Budget Analyst. Category: Finance & Accounting. Experience Required:
    1 years. Education: Bachelor''s in Finance or Bachelor''s in Accounting. Required
    Skills: Budget Planning, Forecasting, Excel, Financial Analysis, Communication,
    Attention to Detail'
  - 'Job Title: Counselor. Category: Human Services & Social Work. Experience Required:
    1 years. Education: Master''s in Counseling or Licensing Credentials. Required
    Skills: Counseling, Active Listening, Problem Solving, Empathy, Communication,
    Treatment Planning'
- source_sentence: 'Domain: Apparel (Senior-level). Education: BA in Strategic Communications
    from Elon University, graduated 2010.. Skills: Excel, PowerPoint, Word, analytical
    and creative thinker, strong communicator, goal-driven.. Experience: Brand Manager
    (2015–present); developed strategies, partnerships, forecasts. Previous roles:
    Omni Buyer, Assistant Buyer, Assistant Planner in apparel/footwear.'
  sentences:
  - 'Job Title: Accountant. Category: Finance & Accounting. Experience Required: 1
    years. Education: Bachelor''s in Accounting or CPA or equivalent. Required Skills:
    Accounting Principles, QuickBooks, Excel, Financial Analysis, Tax Knowledge, GAAP'
  - 'Job Title: Loss Prevention Manager. Category: Retail & Hospitality. Experience
    Required: 2 years. Education: High School or Security Training. Required Skills:
    Security, Surveillance, Investigation, Problem Solving, Leadership, Communication'
  - 'Job Title: Copywriter. Category: Creative & Design. Experience Required: 1 years.
    Education: Bachelor''s in English or Bachelor''s in Marketing. Required Skills:
    Writing, Creativity, SEO Knowledge, Marketing, Brand Voice, Research'
- source_sentence: 'Domain: ACCOUNTANT (Mid-level). Education: B.A. Accounting, Central
    Connecticut (2010); Accounting studies, Univ. of Hartford (2016, GPA 3.8);. Skills:
    ICD-10/ICD-9, CPT/HCPCS, EMR, HIPAA, claim entry/payment posting, insurance verification
    & authorizations, AR/AP, billing, registration, GL/bank recs, variance resolution;.
    Experience: Accountant (2012–2014), Medicare Compliance Coder (2010–2012), Hospital
    Access Rep (2010–2012), Patient Financial Rep (2006–2016);'
  sentences:
  - 'Job Title: 3D Artist. Category: Creative & Design. Experience Required: 1 years.
    Education: Bachelor''s in 3D Art or Certification. Required Skills: 3D Modeling,
    Texturing, Rendering, Software Skills, Creativity, Problem Solving'
  - 'Job Title: Graphic Designer. Category: Creative & Design. Experience Required:
    1 years. Education: Bachelor''s in Graphic Design or Design Certification. Required
    Skills: Design Software, Creativity, Visual Communication, Adobe Creative Suite,
    Branding, Attention to Detail'
  - 'Job Title: Investment Banking Analyst. Category: Finance & Accounting. Experience
    Required: 2 years. Education: Master''s in Finance or Bachelor''s in Finance.
    Required Skills: Financial Modeling, Valuation, Excel, Research, Communication,
    M&A'
- source_sentence: 'Domain: Apparel (Mid-level). Education: BBA Marketing, DePaul
    (2019), GPA 3.0; minor Statistics; Accounting, Economics, Bus Writing, Ethics..
    Skills: Top-20 stylist; AA district sales 1st; avg 40–55% EOD sales; bilingual
    EN/ES; HTML5/CSS; MS Office; adaptable, team, comms, problem-solving. Experience:
    Stylist (Apr 2015–present): client wardrobes, KPIs $80/3 UPT/$300/hr, events +15%;
    Keyholder (Nov 2014–Apr 2015): open/close, supervise; Sales Associate (Feb–Nov
    2014): service, merchandising.'
  sentences:
  - 'Job Title: CFO. Category: Finance & Accounting. Experience Required: 10 years.
    Education: Master''s in Finance or MBA. Required Skills: Strategic Leadership,
    Financial Strategy, Risk Management, Board Communication, M&A, Investor Relations'
  - 'Job Title: Retail Manager. Category: Retail & Hospitality. Experience Required:
    3 years. Education: High School or Associate in Business. Required Skills: Sales
    Management, Customer Service, Inventory Control, Staff Leadership, Cash Handling,
    Problem Solving'
  - 'Job Title: Budget Analyst. Category: Finance & Accounting. Experience Required:
    1 years. Education: Bachelor''s in Finance or Bachelor''s in Accounting. Required
    Skills: Budget Planning, Forecasting, Excel, Financial Analysis, Communication,
    Attention to Detail'
- source_sentence: 'Domain: TEACHER (Senior-level). Education: B.S. Music Education,
    Sterling College (1999); Kansas State University—176 credits toward Music Education..
    Skills: Explicit Instruction, HOTS, Multiple Intelligences; MTSS leader (4 yrs);
    dual-language strategies (11 yrs); rebuilt K-8 program; raised concert attendance
    40%→98%; founded Singing Ambassadors; corporate training/QC; GE Capital President’s
    Council.. Experience: Music teacher 2000–present across K–12; earlier VP HR, scale-interface
    specialist, and QC/training roles.'
  sentences:
  - 'Job Title: Social Worker. Category: Human Services & Social Work. Experience
    Required: 1 years. Education: Master''s in Social Work or MSW License. Required
    Skills: Case Management, Counseling, Problem Solving, Communication, Empathy,
    Crisis Intervention'
  - 'Job Title: School Principal. Category: Education & Training. Experience Required:
    5 years. Education: Master''s in Education or Administrative Certificate. Required
    Skills: Educational Leadership, Management, Budgeting, Staff Management, Community
    Relations, Vision'
  - 'Job Title: Director. Category: Private Sector Management. Experience Required:
    5 years. Education: Bachelor''s in Business or Master''s in Business. Required
    Skills: Strategic Planning, Leadership, Department Management, Budget Control,
    Decision Making, Communication'
pipeline_tag: sentence-similarity
library_name: sentence-transformers
---

# SentenceTransformer based on sentence-transformers/all-MiniLM-L6-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). It maps inputs to a 384-dimensional dense vector space and can be used for semantic textual similarity, semantic search, paraphrase mining, classification, clustering, and more.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) <!-- at revision 1110a243fdf4706b3f48f1d95db1a4f5529b4d41 -->
- **Maximum Sequence Length:** 256 tokens
- **Output Dimensionality:** 384 dimensions
- **Similarity Function:** Cosine Similarity
- **Supported Modality:** Text
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'transformer_task': 'feature-extraction', 'modality_config': {'text': {'method': 'forward', 'method_output_name': 'last_hidden_state'}}, 'module_output_name': 'token_embeddings', 'architecture': 'BertModel'})
  (1): Pooling({'embedding_dimension': 384, 'pooling_mode': 'mean', 'include_prompt': True})
  (2): Normalize({'module_input_name': 'sentence_embedding', 'module_output_name': 'sentence_embedding'})
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```
Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'Domain: TEACHER (Senior-level). Education: B.S. Music Education, Sterling College (1999); Kansas State University—176 credits toward Music Education.. Skills: Explicit Instruction, HOTS, Multiple Intelligences; MTSS leader (4 yrs); dual-language strategies (11 yrs); rebuilt K-8 program; raised concert attendance 40%→98%; founded Singing Ambassadors; corporate training/QC; GE Capital President’s Council.. Experience: Music teacher 2000–present across K–12; earlier VP HR, scale-interface specialist, and QC/training roles.',
    "Job Title: Social Worker. Category: Human Services & Social Work. Experience Required: 1 years. Education: Master's in Social Work or MSW License. Required Skills: Case Management, Counseling, Problem Solving, Communication, Empathy, Crisis Intervention",
    "Job Title: School Principal. Category: Education & Training. Experience Required: 5 years. Education: Master's in Education or Administrative Certificate. Required Skills: Educational Leadership, Management, Budgeting, Staff Management, Community Relations, Vision",
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 384]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[1.0000, 0.4098, 0.4876],
#         [0.4098, 1.0000, 0.7283],
#         [0.4876, 0.7283, 1.0000]])
```
<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 241 training samples
* Columns: <code>anchor</code> and <code>positive</code>
* Approximate statistics based on the first 100 samples:
  |          | anchor                                                                               | positive                                                                           |
  |:---------|:-------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------|
  | type     | string                                                                               | string                                                                             |
  | modality | text                                                                                 | text                                                                               |
  | details  | <ul><li>min: 88 tokens</li><li>mean: 209.22 tokens</li><li>max: 256 tokens</li></ul> | <ul><li>min: 40 tokens</li><li>mean: 49.34 tokens</li><li>max: 56 tokens</li></ul> |
* Samples:
  | anchor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | positive                                                                                                                                                                                                                                                     |
  |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  | <code>Domain: Research Assistant (Entry-level). Education: B.A. in Psychology (Summa Cum Laude, GPA 3.94), Minor in Entrepreneurship, American University (2022–2024); Purdue University (2021); coursework in Cognitive & Health Psychology, CBT, and Stress Management. Skills: Skilled in Excel, SPSS, Tableau, Canva, Google Workspace. Grassroots Health Certified; US Soccer National D License. Dean’s List, Eagle Club Athletic Scholar. Former Division I soccer player (AU & Purdue). Founder, Highland Soccer Camp; U.S. Soccer National Training Center select (2017–18). Experience: Pro Player, Knattspyrnudeild Keflavíkur (2025–); Coach, DC Soccer Club (2023–24); Intern, Valley Oaks Mental Health (2023); Co-founder, Up Your Game Training (2020–22); Intern, Next Level Training (2021)</code>                                                                                                                                                                                                                                     | <code>Job Title: Machine Learning Engineer. Category: Technology. Experience Required: 3 years. Education: Master's in Computer Science or Master's in AI. Required Skills: Python, TensorFlow, PyTorch, Deep Learning, Statistics, Research</code>          |
  | <code>Domain: Finance (Mid-level). Education: B.S. in Finance, Bentley University (Dean’s/President’s List); Study Abroad—Universidad de Navarra (International Business); Advanced Spanish.. Skills: Variance analysis, financial modeling, GL/bank reconciliations, AP/AR, fixed assets & prepaids, investment activity, board reporting, 10-Q/10-K support, SOPs, Advanced Excel, Salesforce, SNL (GL live feed), Primatics Evolv, Intacct, Oracle, Peachtree, Access, PowerPoint; reduced AP processing cost ~95% ($1→$0.05/payment); led Purchase Loan Accounting (Evolv) adding ~$300K/month (~43% EBT); supported Riverside Bank acquisition ($550M→$850M assets).. Experience: Finance Specialist (09/2014–Current, bank)—AP, prepaids, fixed assets, fair-value of acquired loans, purchase accounting SOPs, 10-Q/10-K tables, SNL implementation, GL/bank recs, investments, cross-functional leadership; Deposit Operations Associate (04/2014–08/2014)—items processing, ACH, wires, GL recs, procedure updates; Accounting Associ...</code> | <code>Job Title: CFO. Category: Finance & Accounting. Experience Required: 10 years. Education: Master's in Finance or MBA. Required Skills: Strategic Leadership, Financial Strategy, Risk Management, Board Communication, M&A, Investor Relations</code>  |
  | <code>Domain: Research Assistant (Entry-level). Education: M.A. in Experimental Psychology (2024–2025), B.A. in Psychology with minors in Neuroscience & Philosophy, Iona University; research intern for international ASD study. Skills: Skilled in fNIRS, SuperLab, QEEG, data analysis, project coordination, and scientific writing. Presented research at national conferences. Experienced in IRB formation, study design, and lab management; active in psychology, neuroscience & philosophy clubs. Experience: Head Research Asst. & Lab Tech, Iona Univ. (2023–); Graduate Asst., Center for Student Engagement (2024–25); Clinical Research Asst., Brain Wellness Center (2024). Leads cognitive and behavioral research studies</code>                                                                                                                                                                                                                                                                                                      | <code>Job Title: SAS Programmer. Category: Data & Analytics. Experience Required: 1 years. Education: Bachelor's in Statistics or SAS Certification. Required Skills: SAS, Statistical Analysis, Data Management, Visualization, SQL, Problem Solving</code> |
* Loss: [<code>MultipleNegativesRankingLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#multiplenegativesrankingloss) with these parameters:
  ```json
  {
      "scale": 20.0,
      "similarity_fct": "cos_sim",
      "gather_across_devices": false,
      "directions": [
          "query_to_doc"
      ],
      "partition_mode": "joint",
      "hardness_mode": null,
      "hardness_strength": 0.0
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `per_device_train_batch_size`: 16
- `learning_rate`: 2e-05
- `warmup_steps`: 0.1
- `weight_decay`: 0.01
- `dataloader_pin_memory`: False

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `per_device_train_batch_size`: 16
- `num_train_epochs`: 3
- `max_steps`: -1
- `learning_rate`: 2e-05
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_steps`: 0.1
- `optim`: adamw_torch_fused
- `optim_args`: None
- `weight_decay`: 0.01
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `optim_target_modules`: None
- `gradient_accumulation_steps`: 1
- `average_tokens_across_devices`: True
- `max_grad_norm`: 1.0
- `label_smoothing_factor`: 0.0
- `bf16`: False
- `fp16`: False
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `use_cache`: False
- `neftune_noise_alpha`: None
- `torch_empty_cache_steps`: None
- `auto_find_batch_size`: False
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `include_num_input_tokens_seen`: no
- `log_level`: passive
- `log_level_replica`: warning
- `disable_tqdm`: False
- `project`: huggingface
- `trackio_space_id`: None
- `trackio_bucket_id`: None
- `trackio_static_space_id`: None
- `per_device_eval_batch_size`: 8
- `prediction_loss_only`: True
- `eval_on_start`: False
- `eval_do_concat_batches`: True
- `eval_use_gather_object`: False
- `eval_accumulation_steps`: None
- `include_for_metrics`: []
- `batch_eval_metrics`: False
- `save_only_model`: False
- `save_on_each_node`: False
- `enable_jit_checkpoint`: False
- `push_to_hub`: False
- `hub_private_repo`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_always_push`: False
- `hub_revision`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `restore_callback_states_from_checkpoint`: False
- `full_determinism`: False
- `seed`: 42
- `data_seed`: None
- `use_cpu`: False
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_pin_memory`: False
- `dataloader_persistent_workers`: False
- `dataloader_prefetch_factor`: None
- `dataloader_multiprocessing_context`: None
- `dataloader_in_order`: True
- `remove_unused_columns`: True
- `label_names`: None
- `train_sampling_strategy`: random
- `length_column_name`: length
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `ddp_static_graph`: None
- `ddp_backend`: None
- `ddp_timeout`: 1800
- `fsdp`: None
- `fsdp_config`: None
- `deepspeed`: None
- `debug`: []
- `skip_memory_metrics`: True
- `do_predict`: False
- `resume_from_checkpoint`: None
- `local_rank`: -1
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: proportional
- `router_mapping`: {}
- `learning_rate_mapping`: {}
- `warmup_ratio`: None

</details>

### Training Logs
| Epoch  | Step | Training Loss |
|:------:|:----:|:-------------:|
| 0.3125 | 5    | 3.0525        |
| 0.625  | 10   | 2.5380        |
| 0.9375 | 15   | 2.4993        |
| 1.25   | 20   | 1.9433        |
| 1.5625 | 25   | 2.1547        |
| 1.875  | 30   | 2.0146        |
| 2.1875 | 35   | 1.5669        |
| 2.5    | 40   | 1.9792        |
| 2.8125 | 45   | 1.8938        |


### Training Time
- **Training**: 3.3 minutes

### Framework Versions
- Python: 3.12.10
- Sentence Transformers: 6.1.0
- Transformers: 5.19.0
- PyTorch: 2.14.1+cpu
- Accelerate: 1.15.0
- Datasets: 5.1.0
- Tokenizers: 0.23.2

## Additional Resources

- [Training and Finetuning Embedding Models with Sentence Transformers](https://huggingface.co/blog/train-sentence-transformers): the end-to-end guide for training or finetuning Sentence Transformer models.
- [Introduction to Matryoshka Embedding Models](https://huggingface.co/blog/matryoshka): variable-size embeddings that can be truncated with minimal quality loss.
- [Binary and Scalar Embedding Quantization for Significantly Faster & Cheaper Retrieval](https://huggingface.co/blog/embedding-quantization): post-training compression of embedding vectors.
- [Multimodal Embedding & Reranker Models with Sentence Transformers](https://huggingface.co/blog/multimodal-sentence-transformers): use text, image, audio, and video models through the same API.
- [Training and Finetuning Multimodal Embedding & Reranker Models with Sentence Transformers](https://huggingface.co/blog/train-multimodal-sentence-transformers): train multimodal embedding models, with a Visual Document Retrieval walkthrough.

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

#### MultipleNegativesRankingLoss
```bibtex
@misc{oord2019representationlearningcontrastivepredictive,
      title={Representation Learning with Contrastive Predictive Coding},
      author={Aaron van den Oord and Yazhe Li and Oriol Vinyals},
      year={2019},
      eprint={1807.03748},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/1807.03748},
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->