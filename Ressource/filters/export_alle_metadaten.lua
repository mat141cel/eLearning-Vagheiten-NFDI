-- ===== JSON/YAML Writer =====
local function write_json(tbl, path)
  local fh = assert(io.open(path, "w"))
  fh:write(pandoc.json.encode(tbl, true)) -- pretty
  fh:close()
end

local function yaml_escape(s)
  if s == "" then return '""' end
  if s:match("[:#%-%[%]{},&*!|>'\"%@`%s]") then
    return string.format("%q", s)
  else
    return s
  end
end

local function write_yaml_value(val, indent, fh)
  indent = indent or ""
  local t = type(val)
  if t == "table" then
    local is_array = (#val > 0)
    if is_array then
      for _, v in ipairs(val) do
        fh:write(indent .. "- ")
        if type(v) == "table" then
          fh:write("\n")
          write_yaml_value(v, indent .. "  ", fh)
        else
          fh:write(yaml_escape(tostring(v)) .. "\n")
        end
      end
    else
      for k, v in pairs(val) do
        fh:write(indent .. k .. ":")
        if type(v) == "table" then
          fh:write("\n")
          write_yaml_value(v, indent .. "  ", fh)
        else
          fh:write(" " .. yaml_escape(tostring(v)) .. "\n")
        end
      end
    end
  elseif t == "string" then
    fh:write(indent .. yaml_escape(val) .. "\n")
  else
    fh:write(indent .. tostring(val) .. "\n")
  end
end

local function write_yaml_file(tbl, path)
  local fh = assert(io.open(path, "w"))
  write_yaml_value(tbl, "", fh)
  fh:close()
end

-- ===== Helpers: Env/Paths/Ensure Dir =====
local function have_quarto()
  return (type(quarto) == "table") and (type(quarto.doc) == "table")
end

local function ensure_directory(dir)
  if have_quarto() and quarto.doc.ensure_directory then
    quarto.doc.ensure_directory(dir)
    return
  end
  -- Pandoc Fallback
  if pandoc.system and pandoc.system.make_directory then
    pandoc.system.make_directory(dir, true) -- recursive
    return
  end
  -- Very last resort (OS dependent)
  os.execute(string.format('mkdir "%s" 2> NUL', dir))
end

local function basename_without_ext(path)
  local p = pandoc.path or nil
  if p then
    local fname = p.filename(path)
    local base, _ = p.split_extension(fname)
    return base
  end
  -- crude fallback
  local fname = path:gsub("\\", "/"):match("([^/]+)$") or path
  return (fname:gsub("%.%w+$", ""))
end

local function guess_base_from_state()
  if PANDOC_STATE and PANDOC_STATE.input_files and #PANDOC_STATE.input_files > 0 then
    return basename_without_ext(PANDOC_STATE.input_files[1])
  end
  return "unnamed"
end

local function output_base(doc)
  if have_quarto() then
    return (quarto.doc.slug or quarto.doc.input_file_basename or guess_base_from_state())
  end
  return guess_base_from_state()
end

-- ===== Meta Normalisierung =====
local function normalize(x)
  local ty = pandoc.utils.type(x)
  if ty == "MetaMap" then
    local m = {}
    for k, v in pairs(x) do m[k] = normalize(v) end
    return m
  elseif ty == "MetaList" then
    local out = {}
    for _, v in ipairs(x) do out[#out+1] = normalize(v) end
    return out
  elseif ty == "MetaInlines" or ty == "Inlines" or ty == "MetaBlocks" or ty == "Blocks" then
    return pandoc.utils.stringify(x)
  elseif ty == "MetaString" then
    return x.text
  elseif ty == "MetaBool" then
    return x and true or false
  elseif ty == "MetaNumber" then
    return x
  else
    return x
  end
end

local function normalize_authors(meta_author)
  local A = normalize(meta_author)
  if A == nil or A == "" then return {} end
  if type(A) ~= "table" then
    return { { name = { literal = tostring(A) } } }
  end

  local function name_to_string(name)
    if type(name) == "table" then
      local given  = name.given or ""
      local family = name.family or ""
      local literal = name.literal
      if literal and literal ~= "" then return literal end
      local both = (given ~= "" and family ~= "") and (given .. " " .. family) or (given .. family)
      return both ~= "" and both or nil
    else
      return tostring(name)
    end
  end

  local list = A
  if A.name or A.orcid or A.affiliation then list = { A } end

  local out = {}
  for _, au in ipairs(list) do
    local item = {}
    if type(au) == "string" then
      item.name = { literal = au }
    elseif type(au) == "table" then
      if au.name then
        item.name = {
          given   = au.name.given,
          family  = au.name.family,
          literal = name_to_string(au.name)
        }
      end
      if au.orcid then item.orcid = au.orcid end
      if au.email then item.email = au.email end
      if au.affiliation then item.affiliation = au.affiliation end
      if au.role then item.role = au.role end
      if au.attributes and au.attributes.corresponding ~= nil then
        item.corresponding = au.attributes.corresponding and true or false
      end
    end
    out[#out+1] = item
  end
  return out
end

-- ===== Record bauen (Mapping an Ihr Schema anpassen) =====
local function build_record(doc)
  local M = normalize(doc.meta)
  local rec = {}

  local base = output_base(doc)
  rec.id = (M.doi and M.doi ~= "" and M.doi)
        or (M.id and M.id ~= "" and M.id)
        or base

  rec.title         = M.title
  rec.subtitle      = M.subtitle
  rec.lang          = M.lang
  rec.date          = M.date
  rec["date-modified"] = M["date-modified"] or M.modified
  rec.abstract      = M.abstract
  rec["abstract-title"] = M["abstract-title"]
  rec.description   = M.description

  rec.categories    = M.categories
  rec.keywords      = M.keywords
  rec.license       = M.license
  rec.copyright     = M.copyright
  rec.funding       = M.funding

  rec.bildungsstufe = M.bildungsstufe
  rec.materialart   = M.materialart

  if M.citation then rec.citation = M.citation end

  if doc.meta.author then
    rec.authors = normalize_authors(doc.meta.author)
  end

  return rec
end

local function outdir(doc)
  -- erst aus dem Dokument-Header lesen; NICHT von quarto.doc.meta abhaengig
  local m = doc.meta["export-meta-dir"]
  if m then return pandoc.utils.stringify(m) end
  -- projektweit in Quarto definiert?
  if have_quarto() and quarto.doc.meta and quarto.doc.meta["export-meta-dir"] then
    return pandoc.utils.stringify(quarto.doc.meta["export-meta-dir"])
  end
  return "meta"
end

-- ===== Filter =====
return {
  {
    Pandoc = function(doc)
      local record = build_record(doc)

      local dir = outdir(doc)
      ensure_directory(dir)

      local base = output_base(doc)
      local json_path = (dir .. "/" .. base .. ".json")
      local yml_path  = (dir .. "/" .. base .. ".yml")

      write_json(record, json_path)
      write_yaml_file(record, yml_path)

      if have_quarto() and quarto.log and quarto.log.output_file then
        quarto.log.output_file(json_path)
        quarto.log.output_file(yml_path)
      else
        -- Pandoc-Fallback: still be quiet
      end
      return doc
    end
  }
}
