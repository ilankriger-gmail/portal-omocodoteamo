# Componentes de UI

Este diretório contém componentes reutilizáveis para a interface do usuário do portal.

## Tipografia

Novos componentes e classes de tipografia para melhorar a legibilidade e consistência:

### Componentes de Tipografia

```jsx
import { H1, H2, H3, H4, P, Small, Lead, Display, ListItem, Code, Blockquote } from "@/components/ui/typography";

// Exemplos de uso
<H1>Título Principal</H1>
<H2>Título Secundário</H2>
<H3>Subtítulo</H3>
<P>Texto de parágrafo com melhor legibilidade e contraste.</P>
<Small>Texto pequeno para legendas ou informações secundárias</Small>
<Lead>Texto introdutório com destaque visual</Lead>
```

### Classes de Utilidade

```jsx
<h1 className="heading-xl">Título Principal</h1>
<h2 className="heading-lg">Título Secundário</h2>
<h3 className="heading-md">Subtítulo</h3>
<p className="body">Texto normal</p>
<p className="body-sm">Texto secundário menor</p>
```

## Espaçamento

Novas ferramentas para garantir espaçamento consistente:

### Componente Spacer

```jsx
import { Spacer, Divider } from "@/components/ui/spacer";

// Adiciona espaço vertical médio
<Spacer size="md" />

// Adiciona espaço horizontal pequeno
<Spacer size="sm" axis="horizontal" />

// Adiciona um divisor com espaço
<Divider space="md" />
```

### Componentes de Layout

```jsx
import { Section, Container, HStack, VStack } from "@/components/ui/section";

// Seção com espaçamento vertical
<Section spacing="md">
  <Container size="md">
    Conteúdo com largura máxima e centralizado
  </Container>
</Section>

// Agrupamento horizontal com espaçamento
<HStack spacing="md" align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</HStack>

// Agrupamento vertical com espaçamento
<VStack spacing="md" align="stretch">
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>
```

## Cards

Componentes para criar cards de conteúdo:

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage } from "@/components/ui/card";

// Exemplo de uso
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional do card</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal do card
  </CardContent>
  <CardFooter>
    Rodapé do card com ações ou informações adicionais
  </CardFooter>
</Card>

// Com variantes
<Card variant="highlight">
  // Conteúdo com destaque
</Card>
```

## Botões

Botões com melhor contraste e espaçamento:

```jsx
import { Button } from "@/components/ui/button";

// Exemplo de uso
<Button>Botão Padrão</Button>
<Button variant="secondary">Botão Secundário</Button>
<Button variant="accent">Botão de Destaque</Button>
<Button size="lg">Botão Grande</Button>
<Button loading>Carregando...</Button>
<Button icon={<IconComponent />}>Com Ícone</Button>
```

## Variáveis CSS

O sistema utiliza variáveis CSS para:

1. Espaçamento: `--space-xs`, `--space-sm`, `--space-md`, etc.
2. Tipografia: `--font-size-xs`, `--font-size-sm`, `--font-size-base`, etc.
3. Cores: `--foreground`, `--foreground-secondary`, etc.

Você pode acessar essas variáveis usando:

```css
/* No CSS */
.my-class {
  margin-top: var(--space-md);
  font-size: var(--font-size-lg);
}

/* No Tailwind */
<div className="mt-md text-lg">
  Conteúdo
</div>
```

## Adaptação Mobile

Todos os componentes são responsivos e se adaptam automaticamente para telas menores.