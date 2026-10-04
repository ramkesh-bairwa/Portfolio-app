export const ok = (data, status = 200) => Response.json(data, { status });
export const fail = (error, status = 400, extra = {}) => Response.json({ error, ...extra }, { status });

export async function body(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
