import YAML from "yaml";

export function parseYamlWithFrontmatter<F, C>(
  yaml: string,
): {
  frontmatter: F;
  content: C;
} {
  const frontmatterMatch = yaml.match(/---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
  const content = frontmatter ? yaml.replace(/---\n([\s\S]*?)\n---/, "") : yaml;
  return { frontmatter: YAML.parse(frontmatter), content: YAML.parse(content) };
}
