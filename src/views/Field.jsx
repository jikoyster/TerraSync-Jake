export default function Field({ label, required, wide, children }) {
  return <label className={wide ? 'field wide' : 'field'}><span>{label}{required && <b>*</b>}</span>{children}</label>
}